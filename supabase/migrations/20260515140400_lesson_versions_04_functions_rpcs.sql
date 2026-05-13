-- =============================================================================
-- LESSON VERSIONS — 04_functions_rpcs
-- RPC functions: publish_lesson_version, resolve_delivery_lesson_version,
-- and helper serialize_lesson_blocks_to_lexical
-- =============================================================================

-- =============================================================================
-- Helper: serialize_lesson_blocks_to_lexical
-- Reconstructs Lexical document JSONB from normalized lesson_blocks rows
-- =============================================================================

CREATE OR REPLACE FUNCTION app.serialize_lesson_blocks_to_lexical(
  p_lesson_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, app
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Reconstruct Lexical document from lesson_blocks ordered by meta_order
  -- This function aggregates serialized Lexical nodes back into document structure
  SELECT jsonb_build_object(
    'root', jsonb_build_object(
      'children', (
        SELECT jsonb_agg(lb.value ORDER BY lb.meta_order)
        FROM public.lesson_blocks lb
        WHERE lb.lesson_id = p_lesson_id
      ),
      'direction', NULL,
      'format', '',
      'indent', 0,
      'type', 'root',
      'version', 1
    )
  ) INTO v_result;

  RETURN COALESCE(v_result, jsonb_build_object(
    'root', jsonb_build_object(
      'children', '[]'::jsonb,
      'direction', NULL,
      'format', '',
      'indent', 0,
      'type', 'root',
      'version', 1
    )
  ));
END;
$$;

COMMENT ON FUNCTION app.serialize_lesson_blocks_to_lexical IS
  'Reconstructs canonical Lexical document JSONB from normalized lesson_blocks rows. Used at publish time. Returns empty document if no blocks exist.';

-- =============================================================================
-- RPC: publish_lesson_version
-- Publish immutable lesson version from current draft
-- =============================================================================

CREATE OR REPLACE FUNCTION app.publish_lesson_version(
  p_lesson_id UUID,
  p_change_kind public.lesson_change_kind,
  p_change_note TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app
AS $$
DECLARE
  v_institution_id UUID;
  v_current_major INTEGER;
  v_current_patch INTEGER;
  v_version_id UUID;
  v_lexical_state JSONB;
BEGIN
  -- Verify teacher owns the lesson (SECURITY DEFINER with RLS off)
  IF NOT app.teacher_can_manage_lesson(p_lesson_id) THEN
    RAISE EXCEPTION 'unauthorized: not lesson owner';
  END IF;

  -- Tenant boundary: topics belong to courses; institution lives on courses.
  SELECT c.institution_id
  INTO v_institution_id
  FROM public.lessons l
  JOIN public.topics t ON t.id = l.topic_id
  JOIN public.courses c ON c.id = t.course_id
  WHERE l.id = p_lesson_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'lesson not found or course has no institution';
  END IF;

  -- Reconstruct lexical state from lesson_blocks
  v_lexical_state := app.serialize_lesson_blocks_to_lexical(p_lesson_id);

  -- Determine version numbers
  -- If first publish: major=1, patch=0
  -- If subsequent patch (editorial/safe): same major, patch++
  -- If subsequent major (structural/assessment): major++, patch=0
  SELECT COALESCE(MAX(version_major), 0) INTO v_current_major
  FROM public.lesson_versions
  WHERE institution_id = v_institution_id AND lesson_id = p_lesson_id;

  IF v_current_major = 0 THEN
    -- First publish ever
    v_current_major := 1;
    v_current_patch := 0;
  ELSIF p_change_kind IN ('editorial_patch', 'safe_content_patch') THEN
    -- Increment patch within current major
    SELECT COALESCE(MAX(version_patch), 0) + 1 INTO v_current_patch
    FROM public.lesson_versions
    WHERE institution_id = v_institution_id
      AND lesson_id = p_lesson_id
      AND version_major = v_current_major;
  ELSE
    -- Increment major for structural_major or assessment_major changes
    v_current_major := v_current_major + 1;
    v_current_patch := 0;
  END IF;

  -- Insert immutable lesson version row
  INSERT INTO public.lesson_versions (
    institution_id, lesson_id, version_major, version_patch, change_kind,
    lexical_state, plain_text, content_schema_version, published_by, published_at, is_active
  ) VALUES (
    v_institution_id, p_lesson_id, v_current_major, v_current_patch, p_change_kind,
    v_lexical_state, NULL, 1, (SELECT app.auth_uid()), now(), true
  )
  RETURNING id INTO v_version_id;

  -- Audit event (docs/architecture/db_principles.md + dsgvo-audit-datendefinition.md)
  INSERT INTO public.audit.events (event_type, occurred_at, actor_user_id, institution_id, subject_type, subject_id, metadata)
  VALUES (
    'lesson.published',
    now(),
    (SELECT app.auth_uid()),
    v_institution_id,
    'lesson_version',
    v_version_id,
    jsonb_build_object(
      'lesson_id', p_lesson_id,
      'version_major', v_current_major,
      'version_patch', v_current_patch,
      'change_kind', p_change_kind,
      'change_note', p_change_note,
      'visibility_level', 'institution_admin'
    )
  );

  RETURN v_version_id;
END;
$$;

REVOKE ALL ON FUNCTION app.publish_lesson_version FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.publish_lesson_version TO authenticated;

COMMENT ON FUNCTION app.publish_lesson_version IS
  'Publish immutable lesson version from current draft. Returns lesson_version_id. Requires teacher ownership. Increments patch for editorial/safe changes; increments major for structural/assessment changes.';

-- =============================================================================
-- RPC: resolve_delivery_lesson_version
-- Resolve student-facing lesson version for a course delivery
-- =============================================================================

CREATE OR REPLACE FUNCTION app.resolve_delivery_lesson_version(
  p_course_delivery_id UUID,
  p_lesson_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app
AS $$
DECLARE
  v_course_version_id UUID;
  v_resolution_mode public.lesson_resolution_mode;
  v_allow_auto_patch BOOLEAN;
  v_pinned_version_id UUID;
  v_pinned_major INTEGER;
  v_resolved_version_id UUID;
BEGIN
  -- Verify student can access delivery
  IF NOT app.student_can_access_course_delivery(p_course_delivery_id) THEN
    RAISE EXCEPTION 'access denied for delivery %', p_course_delivery_id;
  END IF;

  -- Get course_version_id from delivery
  SELECT cd.course_version_id
  INTO v_course_version_id
  FROM public.course_deliveries cd
  WHERE cd.id = p_course_delivery_id;

  -- Get resolution settings from course_version_lessons
  SELECT cvl.resolution_mode, cvl.allow_auto_patch, cvl.source_lesson_version_id
  INTO v_resolution_mode, v_allow_auto_patch, v_pinned_version_id
  FROM public.course_version_lessons cvl
  WHERE cvl.course_version_id = v_course_version_id
    AND cvl.source_lesson_id = p_lesson_id;

  -- If pinned or auto_patch disabled, return pinned version
  IF v_resolution_mode = 'pinned' OR v_allow_auto_patch IS FALSE THEN
    RETURN v_pinned_version_id;
  END IF;

  -- Otherwise, resolve auto_patch: find latest active patch within same major
  SELECT lv.version_major
  INTO v_pinned_major
  FROM public.lesson_versions lv
  WHERE lv.id = v_pinned_version_id;

  SELECT lv.id
  INTO v_resolved_version_id
  FROM public.lesson_versions lv
  WHERE lv.lesson_id = p_lesson_id
    AND lv.version_major = v_pinned_major
    AND lv.change_kind IN ('editorial_patch', 'safe_content_patch')
    AND lv.is_active IS TRUE
  ORDER BY lv.version_patch DESC
  LIMIT 1;

  -- Return resolved version, or fall back to pinned if no eligible patch found
  RETURN COALESCE(v_resolved_version_id, v_pinned_version_id);
END;
$$;

REVOKE ALL ON FUNCTION app.resolve_delivery_lesson_version FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.resolve_delivery_lesson_version TO authenticated;

COMMENT ON FUNCTION app.resolve_delivery_lesson_version IS
  'Resolve student-facing lesson version for a delivery. Pinned → always return pinned version. Auto-patch → follow latest active editorial/safe patch within same major.';
