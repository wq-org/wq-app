-- =============================================================================
-- LESSONS — super-admin bypass + audit trail for teacher lesson RPCs
--
-- Problem: get_teacher_lesson and get_teacher_lesson_topic_ref check
-- app.teacher_can_manage_lesson() which returns false for super-admins because
-- they are not the lesson owner (teacher_id). Super-admins need read-only
-- access to any lesson for platform review (LfDI Baden-Württemberg audit
-- requirement: privileged cross-tenant reads must be traceable).
--
-- Fix:
--   1. Add app.is_super_admin() bypass to the authorization guard in each RPC.
--   2. When the super-admin path is taken, write an audit event so that
--      "who saw what content, when" is reconstructable.
--   3. Also add institution_admin SELECT policy on public.lessons (base table)
--      so institution admins can view lesson content from their own teachers
--      without hitting the same RLS timeout as before.
--
-- Writes (create, update, save_draft, publish) remain teacher-only — this
-- migration only widens read access.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. get_teacher_lesson — super-admin bypass with audit event
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_lesson(
  p_lesson_id uuid
)
RETURNS TABLE (
  id                     uuid,
  title                  text,
  description            text,
  content                jsonb,
  content_schema_version integer,
  created_at             timestamptz,
  updated_at             timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, app, audit, pg_temp
SET row_security = off
AS $$
DECLARE
  v_is_super_admin boolean;
  v_institution_id uuid;
BEGIN
  v_is_super_admin := (SELECT app.is_super_admin());

  IF NOT (app.teacher_can_manage_lesson(p_lesson_id) OR v_is_super_admin) THEN
    RAISE EXCEPTION 'unauthorized: not lesson owner';
  END IF;

  -- Resolve institution for audit envelope (lesson → topic → course → institution_id)
  IF v_is_super_admin AND NOT app.teacher_can_manage_lesson(p_lesson_id) THEN
    SELECT c.institution_id
    INTO v_institution_id
    FROM public.lessons lesson_row
    JOIN public.topics topic_row ON topic_row.id = lesson_row.topic_id
    JOIN public.courses c ON c.id = topic_row.course_id
    WHERE lesson_row.id = p_lesson_id;

    PERFORM audit.log_event(
      p_event_type     := 'super_admin.lesson.read',
      p_subject_type   := 'lesson',
      p_subject_id     := p_lesson_id,
      p_institution_id := v_institution_id,
      p_payload        := jsonb_build_object('action', 'platform_review'),
      p_metadata       := jsonb_build_object(
        'visibility_level', 'super_admin',
        'context', jsonb_build_object('lesson_id', p_lesson_id)
      )
    );
  END IF;

  RETURN QUERY
  SELECT
    lesson_row.id,
    lesson_row.title,
    lesson_row.description,
    lesson_row.content,
    lesson_row.content_schema_version,
    lesson_row.created_at,
    lesson_row.updated_at
  FROM public.lessons lesson_row
  WHERE lesson_row.id = p_lesson_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'lesson not found';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_teacher_lesson(uuid) IS
  'Lesson detail RPC. Owners (teachers) and super-admins may call it; super-admin '
  'access writes a super_admin.lesson.read audit event per DSGVO traceability requirement.';

REVOKE ALL ON FUNCTION public.get_teacher_lesson(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_teacher_lesson(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. get_teacher_lesson_topic_ref — super-admin bypass with audit event
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_lesson_topic_ref(
  p_lesson_id uuid
)
RETURNS TABLE (
  id       uuid,
  topic_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, app, audit, pg_temp
SET row_security = off
AS $$
DECLARE
  v_is_super_admin boolean;
  v_institution_id uuid;
BEGIN
  v_is_super_admin := (SELECT app.is_super_admin());

  IF NOT (app.teacher_can_manage_lesson(p_lesson_id) OR v_is_super_admin) THEN
    RAISE EXCEPTION 'unauthorized: not lesson owner';
  END IF;

  IF v_is_super_admin AND NOT app.teacher_can_manage_lesson(p_lesson_id) THEN
    SELECT c.institution_id
    INTO v_institution_id
    FROM public.lessons lesson_row
    JOIN public.topics topic_row ON topic_row.id = lesson_row.topic_id
    JOIN public.courses c ON c.id = topic_row.course_id
    WHERE lesson_row.id = p_lesson_id;

    PERFORM audit.log_event(
      p_event_type     := 'super_admin.lesson.topic_ref.read',
      p_subject_type   := 'lesson',
      p_subject_id     := p_lesson_id,
      p_institution_id := v_institution_id,
      p_payload        := jsonb_build_object('action', 'topic_ref_lookup'),
      p_metadata       := jsonb_build_object(
        'visibility_level', 'super_admin',
        'context', jsonb_build_object('lesson_id', p_lesson_id)
      )
    );
  END IF;

  RETURN QUERY
  SELECT lesson_row.id, lesson_row.topic_id
  FROM public.lessons lesson_row
  WHERE lesson_row.id = p_lesson_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'lesson not found';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_teacher_lesson_topic_ref(uuid) IS
  'Lesson → topic lookup RPC. Owners and super-admins may call it; super-admin '
  'path writes a super_admin.lesson.topic_ref.read audit event.';

REVOKE ALL ON FUNCTION public.get_teacher_lesson_topic_ref(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_teacher_lesson_topic_ref(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Institution admin SELECT on public.lessons (base draft table)
--    Allows institution admins to read lessons from their own teachers
--    without triggering the RLS timeout path that caused migration 105.
--    Insert/Update/Delete remain teacher-only.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS lessons_select_institution_admin ON public.lessons;
CREATE POLICY lessons_select_institution_admin ON public.lessons
  FOR SELECT TO authenticated
  USING (
    topic_id IN (
      SELECT t.id
      FROM public.topics t
      JOIN public.courses c ON c.id = t.course_id
      WHERE c.institution_id IN (SELECT app.admin_institution_ids())
    )
  );
