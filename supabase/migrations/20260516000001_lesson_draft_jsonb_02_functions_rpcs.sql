-- =============================================================================
-- LESSON DRAFT JSONB — 02_functions_rpcs
-- Retarget publish flow to lessons.content instead of lesson_blocks.
-- Follows docs/architecture/principle_database.md (SECURITY DEFINER + pinned search_path;
-- audit envelope on publish).
-- =============================================================================

COMMENT ON COLUMN public.lesson_versions.lexical_state IS
  'Canonical Lexical document JSONB captured from lessons.content at publish time.';

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
  v_content_schema_version INTEGER;
BEGIN
  IF NOT app.teacher_can_manage_lesson(p_lesson_id) THEN
    RAISE EXCEPTION 'unauthorized: not lesson owner';
  END IF;

  SELECT
    c.institution_id,
    COALESCE(l.content, app.empty_lesson_lexical_state()),
    COALESCE(l.content_schema_version, 1)
  INTO
    v_institution_id,
    v_lexical_state,
    v_content_schema_version
  FROM public.lessons l
  JOIN public.topics t ON t.id = l.topic_id
  JOIN public.courses c ON c.id = t.course_id
  WHERE l.id = p_lesson_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'lesson not found or course has no institution';
  END IF;

  SELECT COALESCE(MAX(version_major), 0)
  INTO v_current_major
  FROM public.lesson_versions
  WHERE institution_id = v_institution_id
    AND lesson_id = p_lesson_id;

  IF v_current_major = 0 THEN
    v_current_major := 1;
    v_current_patch := 0;
  ELSIF p_change_kind IN ('editorial_patch', 'safe_content_patch') THEN
    SELECT COALESCE(MAX(version_patch), 0) + 1
    INTO v_current_patch
    FROM public.lesson_versions
    WHERE institution_id = v_institution_id
      AND lesson_id = p_lesson_id
      AND version_major = v_current_major;
  ELSE
    v_current_major := v_current_major + 1;
    v_current_patch := 0;
  END IF;

  INSERT INTO public.lesson_versions (
    institution_id,
    lesson_id,
    version_major,
    version_patch,
    change_kind,
    lexical_state,
    plain_text,
    content_schema_version,
    published_by,
    published_at,
    is_active
  ) VALUES (
    v_institution_id,
    p_lesson_id,
    v_current_major,
    v_current_patch,
    p_change_kind,
    v_lexical_state,
    NULL,
    v_content_schema_version,
    (SELECT app.auth_uid()),
    now(),
    true
  )
  RETURNING id INTO v_version_id;

  INSERT INTO public.audit.events (
    event_type,
    occurred_at,
    actor_user_id,
    institution_id,
    subject_type,
    subject_id,
    metadata
  ) VALUES (
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

REVOKE ALL ON FUNCTION app.publish_lesson_version(UUID, public.lesson_change_kind, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.publish_lesson_version(UUID, public.lesson_change_kind, TEXT) TO authenticated;

COMMENT ON FUNCTION app.publish_lesson_version IS
  'Publish immutable lesson version from lessons.content. Returns lesson_version_id. Requires teacher ownership.';

