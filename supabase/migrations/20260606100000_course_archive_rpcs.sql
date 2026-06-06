-- =============================================================================
-- COURSE ARCHIVE — guarded archive action for course versions
-- =============================================================================

CREATE OR REPLACE FUNCTION app.archive_course_version(p_course_version_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_version record;
  v_has_newer_published_version boolean;
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT
    cv.id,
    cv.institution_id,
    cv.course_id,
    cv.version_no,
    cv.status
  INTO v_version
  FROM public.course_versions cv
  WHERE cv.id = p_course_version_id
  FOR UPDATE;

  IF v_version.id IS NULL THEN
    RAISE EXCEPTION 'course version not found';
  END IF;

  IF v_version.status <> 'published'::public.course_version_status THEN
    RAISE EXCEPTION 'only published course versions can be archived';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin()) IS TRUE
    OR v_version.institution_id IN (SELECT app.admin_institution_ids())
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = v_version.course_id
        AND c.teacher_id = v_user_id
    )
  ) THEN
    RAISE EXCEPTION 'course version archive access denied';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.course_versions cv
    WHERE cv.course_id = v_version.course_id
      AND cv.status = 'published'::public.course_version_status
      AND cv.version_no > v_version.version_no
  )
  INTO v_has_newer_published_version;

  IF v_has_newer_published_version IS NOT TRUE THEN
    RAISE EXCEPTION 'latest published course version cannot be archived';
  END IF;

  UPDATE public.course_deliveries
  SET
    status = 'archived'::public.course_delivery_status,
    updated_at = now()
  WHERE course_version_id = v_version.id
    AND deleted_at IS NULL
    AND status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status
    );

  UPDATE public.course_versions
  SET
    status = 'archived'::public.course_version_status,
    updated_at = now()
  WHERE id = v_version.id;
END;
$$;

COMMENT ON FUNCTION app.archive_course_version(uuid) IS
  'Archive an old published course version and end active/scheduled deliveries for that version without deleting progress or learning events.';

REVOKE ALL ON FUNCTION app.archive_course_version(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.archive_course_version(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.archive_course_version(p_course_version_id uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.archive_course_version(p_course_version_id);
$$;

COMMENT ON FUNCTION public.archive_course_version(uuid) IS
  'Public wrapper for app.archive_course_version.';

REVOKE ALL ON FUNCTION public.archive_course_version(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.archive_course_version(uuid) TO authenticated;
