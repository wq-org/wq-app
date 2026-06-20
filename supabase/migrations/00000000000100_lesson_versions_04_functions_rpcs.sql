-- =============================================================================
-- LESSON VERSIONS — 04_functions_rpcs
-- Helpers + RPC function: teacher ownership and resolve_delivery_lesson_version
-- =============================================================================

CREATE OR REPLACE FUNCTION app.teacher_can_manage_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lessons lesson_row
    INNER JOIN public.topics topic_row
      ON topic_row.id = lesson_row.topic_id
    INNER JOIN public.courses course_row
      ON course_row.id = topic_row.course_id
    WHERE lesson_row.id = p_lesson_id
      AND course_row.teacher_id = (SELECT auth.uid())
  );
$$;

COMMENT ON FUNCTION app.teacher_can_manage_lesson(uuid) IS
  'True when caller owns the course that contains the lesson. SECURITY DEFINER with row_security off only for this bounded lesson -> topic -> course ownership scan.';

REVOKE ALL ON FUNCTION app.teacher_can_manage_lesson(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.teacher_can_manage_lesson(uuid) TO authenticated;

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
