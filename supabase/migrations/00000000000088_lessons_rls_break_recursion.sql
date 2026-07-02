-- =============================================================================
-- LESSONS — break teacher-facing RLS timeout paths with bounded RPCs
--
-- Problem:
-- - Teacher lesson create/load/update/list flows hit public.lessons directly.
-- - public.lessons, public.topics, and public.courses all run under FORCE RLS.
-- - PostgREST INSERT ... RETURNING / SELECT paths can re-enter nested policy
--   evaluation and surface as statement_timeout (57014).
--
-- Fix:
-- - keep a cheap teacher lesson policy helper for any remaining direct access
-- - add narrow SECURITY DEFINER RPCs for teacher lesson CRUD/read flows
-- - each RPC authorizes once, then performs a bounded read/write with
--   row_security = off
-- =============================================================================

CREATE OR REPLACE FUNCTION app.teacher_can_manage_topic(p_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.topics topic_row
    INNER JOIN public.courses course_row
      ON course_row.id = topic_row.course_id
    WHERE topic_row.id = p_topic_id
      AND course_row.teacher_id = (SELECT auth.uid())
  );
$$;

COMMENT ON FUNCTION app.teacher_can_manage_topic(uuid) IS
  'True when caller owns the course that contains the topic. SECURITY DEFINER '
  'with row_security off only for this bounded topic -> course ownership scan '
  'to avoid lessons/topic/course RLS re-entry and statement_timeout (57014) on '
  'teacher lesson creation and reads.';

REVOKE ALL ON FUNCTION app.teacher_can_manage_topic(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.teacher_can_manage_topic(uuid) TO authenticated;

DROP POLICY IF EXISTS "Teachers can manage lessons in their topics" ON public.lessons;
DROP POLICY IF EXISTS lessons_manage ON public.lessons;
DROP POLICY IF EXISTS lessons_all_teacher ON public.lessons;

CREATE POLICY lessons_all_teacher ON public.lessons
  FOR ALL TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR app.teacher_can_manage_topic(topic_id)
  )
  WITH CHECK (
    (SELECT app.is_super_admin()) IS TRUE
    OR app.teacher_can_manage_topic(topic_id)
  );

CREATE OR REPLACE FUNCTION public.create_teacher_lesson(
  p_topic_id uuid,
  p_title text,
  p_description text DEFAULT ''
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  content jsonb,
  content_schema_version integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  IF NOT app.teacher_can_manage_topic(p_topic_id) THEN
    RAISE EXCEPTION 'unauthorized: not topic owner';
  END IF;

  RETURN QUERY
  INSERT INTO public.lessons (
    title,
    description,
    topic_id,
    content,
    content_schema_version
  )
  VALUES (
    btrim(COALESCE(p_title, '')),
    COALESCE(p_description, ''),
    p_topic_id,
    app.empty_lesson_lexical_state(),
    1
  )
  RETURNING
    lessons.id,
    lessons.title,
    lessons.description,
    lessons.content,
    lessons.content_schema_version,
    lessons.created_at,
    lessons.updated_at;
END;
$$;

COMMENT ON FUNCTION public.create_teacher_lesson(uuid, text, text) IS
  'Teacher-only lesson create RPC. Authorizes via app.teacher_can_manage_topic '
  'then inserts into public.lessons with bounded SECURITY DEFINER scope.';

REVOKE ALL ON FUNCTION public.create_teacher_lesson(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_teacher_lesson(uuid, text, text) TO authenticated;

-- Reads (get_teacher_lesson, get_teacher_lesson_topic_ref) also allow
-- super-admins for platform review; that path writes an audit event so
-- privileged cross-tenant reads stay traceable (LfDI Baden-Württemberg).
-- Writes (create, update, delete) remain teacher-only.
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

CREATE OR REPLACE FUNCTION public.list_teacher_lessons_by_topic(
  p_topic_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  IF NOT app.teacher_can_manage_topic(p_topic_id) THEN
    RAISE EXCEPTION 'unauthorized: not topic owner';
  END IF;

  RETURN QUERY
  SELECT
    lesson_row.id,
    lesson_row.title,
    lesson_row.description,
    lesson_row.created_at,
    lesson_row.updated_at
  FROM public.lessons lesson_row
  WHERE lesson_row.topic_id = p_topic_id
  ORDER BY lesson_row.created_at ASC;
END;
$$;

COMMENT ON FUNCTION public.list_teacher_lessons_by_topic(uuid) IS
  'Teacher-only lesson list RPC for topic pages. Returns lightweight lesson '
  'metadata without invoking public.lessons SELECT RLS.';

REVOKE ALL ON FUNCTION public.list_teacher_lessons_by_topic(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_teacher_lessons_by_topic(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_teacher_lesson(
  p_lesson_id uuid,
  p_updates jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  content jsonb,
  content_schema_version integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_updates jsonb := COALESCE(p_updates, '{}'::jsonb);
BEGIN
  IF NOT app.teacher_can_manage_lesson(p_lesson_id) THEN
    RAISE EXCEPTION 'unauthorized: not lesson owner';
  END IF;

  RETURN QUERY
  UPDATE public.lessons AS lesson_row
  SET
    title = CASE
      WHEN v_updates ? 'title' THEN btrim(COALESCE(v_updates->>'title', ''))
      ELSE lesson_row.title
    END,
    description = CASE
      WHEN v_updates ? 'description' THEN COALESCE(v_updates->>'description', '')
      ELSE lesson_row.description
    END,
    content = CASE
      WHEN v_updates ? 'content' THEN COALESCE(v_updates->'content', app.empty_lesson_lexical_state())
      ELSE lesson_row.content
    END,
    content_schema_version = CASE
      WHEN v_updates ? 'content_schema_version'
        THEN GREATEST(COALESCE((v_updates->>'content_schema_version')::integer, 1), 1)
      ELSE lesson_row.content_schema_version
    END
  WHERE lesson_row.id = p_lesson_id
  RETURNING
    lesson_row.id,
    lesson_row.title,
    lesson_row.description,
    lesson_row.content,
    lesson_row.content_schema_version,
    lesson_row.created_at,
    lesson_row.updated_at;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'lesson not found';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.update_teacher_lesson(uuid, jsonb) IS
  'Teacher-only lesson update RPC. Applies only keys present in p_updates '
  '(title, description, content, content_schema_version).';

REVOKE ALL ON FUNCTION public.update_teacher_lesson(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_teacher_lesson(uuid, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_teacher_lesson(
  p_lesson_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
BEGIN
  IF NOT app.teacher_can_manage_lesson(p_lesson_id) THEN
    RAISE EXCEPTION 'unauthorized: not lesson owner';
  END IF;

  DELETE FROM public.lessons lesson_row
  WHERE lesson_row.id = p_lesson_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'lesson not found';
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.delete_teacher_lesson(uuid) IS
  'Teacher-only lesson delete RPC with bounded ownership authorization.';

REVOKE ALL ON FUNCTION public.delete_teacher_lesson(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_teacher_lesson(uuid) TO authenticated;

-- Institution admins can read lesson content from their own teachers without
-- hitting the RLS timeout path. Insert/Update/Delete remain teacher-only.
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

-- Make the new RPCs visible to PostgREST immediately.
-- Self-hosted PostgREST caches the schema and only refreshes on this NOTIFY
-- or a container restart. Without this line, PGRST202 "function not found"
-- persists even after the migration has applied.
NOTIFY pgrst, 'reload schema';
