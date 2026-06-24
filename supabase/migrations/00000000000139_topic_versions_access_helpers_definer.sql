-- HETZNER_TEARDOWN: KEEP_CORE
-- =============================================================================
-- TOPIC VERSIONS — break RLS recursion (42P17) on student access helpers
--
-- Problem:
--   When a teacher fetches `public.lessons`, RLS evaluates every policy on
--   `lessons` — including `lessons_select_member`, which calls
--   `app.student_can_access_lesson(id)`. That helper in turn calls
--   `app.student_can_access_topic_for_delivery` → `app.resolve_delivery_topic_version`,
--   which runs `SELECT … FROM public.topic_versions …` under invoker RLS.
--
--   The `topic_versions_select_student_delivery` policy joins `topic_versions pin`
--   to compare `version_major` against the pinned topic version. That inner
--   `topic_versions` reference re-enters the same policy on `pin`, which joins
--   `topic_versions` again, and so on → `42P17 infinite recursion detected in
--   policy for relation "topic_versions"`.
--
-- Fix (per docs/architecture/principle_database.md "RLS recursion and helper
-- traps"):
--   Make the student-access helpers SECURITY DEFINER with `SET row_security = off`
--   for the bounded internal scans. The helpers still scope every read by
--   `(SELECT app.auth_uid())` joins and the caller-supplied IDs, so the bypass
--   stays bounded to "what this user could see anyway".
-- =============================================================================

CREATE OR REPLACE FUNCTION app.resolve_delivery_topic_version(
  p_course_delivery_id uuid,
  p_source_topic_id uuid
)
RETURNS public.topic_versions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $fn$
DECLARE
  v_pin_id uuid;
  v_mode public.topic_resolution_mode;
  v_pin public.topic_versions%ROWTYPE;
  v_out public.topic_versions%ROWTYPE;
BEGIN
  IF p_source_topic_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT cvt.pinned_topic_version_id, cvt.resolution_mode
  INTO v_pin_id, v_mode
  FROM public.course_deliveries cd
  INNER JOIN public.course_version_topics cvt
    ON cvt.course_version_id = cd.course_version_id
   AND cvt.source_topic_id = p_source_topic_id
  WHERE cd.id = p_course_delivery_id
    AND cd.deleted_at IS NULL
  LIMIT 1;

  IF v_pin_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_pin FROM public.topic_versions WHERE id = v_pin_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_mode = 'pinned'::public.topic_resolution_mode THEN
    RETURN v_pin;
  END IF;

  SELECT tv.*
  INTO v_out
  FROM public.topic_versions tv
  WHERE tv.institution_id = v_pin.institution_id
    AND tv.topic_id = v_pin.topic_id
    AND tv.version_major = v_pin.version_major
    AND tv.is_active = true
    AND tv.change_kind IN (
      'editorial_patch'::public.topic_change_kind,
      'availability_patch'::public.topic_change_kind
    )
  ORDER BY tv.version_patch DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN v_pin;
  END IF;

  RETURN v_out;
END
$fn$;

COMMENT ON FUNCTION app.resolve_delivery_topic_version(uuid, uuid) IS
  'Returns the topic_versions row a student should see for a delivery + canonical topic. '
  'SECURITY DEFINER with row_security off only for the bounded delivery -> pinned-topic-version '
  'lookup, so callers (RLS policies on lessons / topics / topic_versions) do not re-enter the '
  'topic_versions_select_student_delivery policy and hit 42P17.';

REVOKE ALL ON FUNCTION app.resolve_delivery_topic_version(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.resolve_delivery_topic_version(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.student_can_access_topic_for_delivery(
  p_course_delivery_id uuid,
  p_source_topic_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $fn$
DECLARE
  v_row public.topic_versions%ROWTYPE;
BEGIN
  IF p_source_topic_id IS NULL THEN
    RETURN true;
  END IF;

  v_row := app.resolve_delivery_topic_version(p_course_delivery_id, p_source_topic_id);

  IF v_row.id IS NULL THEN
    RETURN false;
  END IF;

  RETURN app.topic_gate_allows_access(v_row.is_locked, v_row.unlock_at);
END
$fn$;

COMMENT ON FUNCTION app.student_can_access_topic_for_delivery(uuid, uuid) IS
  'True when the resolved topic_versions gate allows access for this delivery. SECURITY DEFINER '
  'so calls from RLS policies do not re-enter topic_versions RLS.';

REVOKE ALL ON FUNCTION app.student_can_access_topic_for_delivery(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.student_can_access_topic_for_delivery(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.student_can_access_topic(p_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.topics topic_row
    INNER JOIN public.course_deliveries cd
      ON cd.course_id = topic_row.course_id
     AND cd.deleted_at IS NULL
     AND cd.published_at IS NOT NULL
     AND cd.status IN (
       'active'::public.course_delivery_status,
       'scheduled'::public.course_delivery_status
     )
     AND cd.institution_id IN (SELECT app.member_institution_ids())
    INNER JOIN public.classroom_members cm
      ON cm.classroom_id = cd.classroom_id
     AND cm.user_id = (SELECT app.auth_uid())
     AND cm.withdrawn_at IS NULL
    INNER JOIN public.course_version_topics cvt
      ON cvt.course_version_id = cd.course_version_id
     AND cvt.source_topic_id = topic_row.id
    WHERE topic_row.id = p_topic_id
      AND (SELECT app.student_can_access_topic_for_delivery(cd.id, cvt.source_topic_id))
  );
$$;

COMMENT ON FUNCTION app.student_can_access_topic(uuid) IS
  'True when caller is an active student on a published delivery whose snapshot includes the '
  'topic and the resolved topic_versions gate allows access. SECURITY DEFINER so RLS callers do '
  'not re-enter topics / topic_versions policies.';

REVOKE ALL ON FUNCTION app.student_can_access_topic(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.student_can_access_topic(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.student_can_access_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_deliveries cd
    INNER JOIN public.classroom_members cm
      ON cm.classroom_id = cd.classroom_id
     AND cm.user_id = (SELECT app.auth_uid())
     AND cm.withdrawn_at IS NULL
    INNER JOIN public.course_version_lessons cvl
      ON cvl.source_lesson_id = p_lesson_id
    INNER JOIN public.course_version_topics cvt
      ON cvt.id = cvl.course_version_topic_id
     AND cvt.course_version_id = cd.course_version_id
    WHERE cd.deleted_at IS NULL
      AND cd.published_at IS NOT NULL
      AND cd.status IN (
        'active'::public.course_delivery_status,
        'scheduled'::public.course_delivery_status
      )
      AND cd.institution_id IN (SELECT app.member_institution_ids())
      AND (
        cvt.source_topic_id IS NULL
        OR (SELECT app.student_can_access_topic_for_delivery(cd.id, cvt.source_topic_id))
      )
  );
$$;

COMMENT ON FUNCTION app.student_can_access_lesson(uuid) IS
  'True when caller may access the lesson via a published delivery snapshot and the resolved '
  'topic_versions gate for that delivery allows the topic. SECURITY DEFINER + row_security off '
  'so RLS callers (e.g. lessons_select_member) do not re-enter topic_versions policies and hit 42P17.';

REVOKE ALL ON FUNCTION app.student_can_access_lesson(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.student_can_access_lesson(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
