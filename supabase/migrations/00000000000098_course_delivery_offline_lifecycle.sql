-- =============================================================================
-- COURSE DELIVERY — offline lifecycle and current-delivery invariant
-- =============================================================================

DROP INDEX IF EXISTS public.idx_course_deliveries_current_classroom_course;

CREATE UNIQUE INDEX idx_course_deliveries_current_classroom_course
  ON public.course_deliveries (classroom_id, course_id)
  WHERE deleted_at IS NULL
    AND status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status,
      'offline'::public.course_delivery_status
    );

COMMENT ON INDEX public.idx_course_deliveries_current_classroom_course IS
  'Enforces one non-final current delivery per classroom and course. Active/scheduled are student-visible; offline is hidden but reversible; archived/canceled remain historical.';

COMMENT ON COLUMN public.course_deliveries.status IS
  'draft / scheduled / active / offline / archived / canceled. Offline hides a delivery from students without final archival.';

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
      'scheduled'::public.course_delivery_status,
      'offline'::public.course_delivery_status
    );

  UPDATE public.course_versions
  SET
    status = 'archived'::public.course_version_status,
    updated_at = now()
  WHERE id = v_version.id;
END;
$$;

COMMENT ON FUNCTION app.archive_course_version(uuid) IS
  'Archive an old published course version and end active/scheduled/offline deliveries for that version without deleting progress or learning events.';

CREATE OR REPLACE FUNCTION app.take_course_deliveries_offline(p_course_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_course record;
  v_affected_count integer := 0;
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT c.id, c.institution_id, c.teacher_id
  INTO v_course
  FROM public.courses c
  WHERE c.id = p_course_id
  FOR UPDATE;

  IF v_course.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin()) IS TRUE
    OR v_course.institution_id IN (SELECT app.admin_institution_ids())
    OR v_course.teacher_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'course delivery offline access denied';
  END IF;

  PERFORM 1
  FROM public.course_deliveries cd
  WHERE cd.course_id = p_course_id
    AND cd.institution_id = v_course.institution_id
    AND cd.deleted_at IS NULL
    AND cd.status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status
    )
  FOR UPDATE;

  UPDATE public.course_deliveries
  SET
    status = 'offline'::public.course_delivery_status,
    updated_at = now()
  WHERE course_id = p_course_id
    AND institution_id = v_course.institution_id
    AND deleted_at IS NULL
    AND status IN (
      'active'::public.course_delivery_status,
      'scheduled'::public.course_delivery_status
    );

  GET DIAGNOSTICS v_affected_count = ROW_COUNT;

  RETURN v_affected_count;
END;
$$;

COMMENT ON FUNCTION app.take_course_deliveries_offline(uuid) IS
  'Temporarily hide current active/scheduled course deliveries from students by moving them to offline; rows remain restorable and historical.';

REVOKE ALL ON FUNCTION app.take_course_deliveries_offline(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.take_course_deliveries_offline(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.take_course_deliveries_offline(p_course_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.take_course_deliveries_offline(p_course_id);
$$;

COMMENT ON FUNCTION public.take_course_deliveries_offline(uuid) IS
  'Public wrapper for app.take_course_deliveries_offline.';

REVOKE ALL ON FUNCTION public.take_course_deliveries_offline(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.take_course_deliveries_offline(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION app.restore_course_deliveries_online(p_course_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_course record;
  v_affected_count integer := 0;
BEGIN
  v_user_id := app.auth_uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  SELECT c.id, c.institution_id, c.teacher_id
  INTO v_course
  FROM public.courses c
  WHERE c.id = p_course_id
  FOR UPDATE;

  IF v_course.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin()) IS TRUE
    OR v_course.institution_id IN (SELECT app.admin_institution_ids())
    OR v_course.teacher_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'course delivery restore access denied';
  END IF;

  PERFORM 1
  FROM public.course_deliveries cd
  WHERE cd.course_id = p_course_id
    AND cd.institution_id = v_course.institution_id
    AND cd.deleted_at IS NULL
    AND cd.status = 'offline'::public.course_delivery_status
  FOR UPDATE;

  UPDATE public.course_deliveries
  SET
    status = 'active'::public.course_delivery_status,
    updated_at = now()
  WHERE course_id = p_course_id
    AND institution_id = v_course.institution_id
    AND deleted_at IS NULL
    AND status = 'offline'::public.course_delivery_status;

  GET DIAGNOSTICS v_affected_count = ROW_COUNT;

  RETURN v_affected_count;
END;
$$;

COMMENT ON FUNCTION app.restore_course_deliveries_online(uuid) IS
  'Restore reversible offline course deliveries to active student-visible deliveries.';

REVOKE ALL ON FUNCTION app.restore_course_deliveries_online(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.restore_course_deliveries_online(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.restore_course_deliveries_online(p_course_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT app.restore_course_deliveries_online(p_course_id);
$$;

COMMENT ON FUNCTION public.restore_course_deliveries_online(uuid) IS
  'Public wrapper for app.restore_course_deliveries_online.';

REVOKE ALL ON FUNCTION public.restore_course_deliveries_online(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_course_deliveries_online(uuid) TO authenticated;
