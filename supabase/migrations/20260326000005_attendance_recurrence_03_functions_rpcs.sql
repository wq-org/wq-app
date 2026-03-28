-- =============================================================================
-- ATTENDANCE RECURRING SCHEDULES — functions & RPCs
-- Requires: 20260326000005_attendance_recurrence_02_indexes_constraints
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Permission helper
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.caller_can_manage_attendance_schedule(
  p_classroom_id uuid,
  p_course_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT app.caller_can_manage_classroom(p_classroom_id)
      OR app.caller_can_manage_course(p_course_id)
      OR EXISTS (
        SELECT 1
        FROM public.classrooms classroom_row
        WHERE classroom_row.id = p_classroom_id
          AND classroom_row.institution_id IN (SELECT app.admin_institution_ids())
      )
      OR EXISTS (
        SELECT 1
        FROM public.courses course_row
        WHERE course_row.id = p_course_id
          AND course_row.institution_id IN (SELECT app.admin_institution_ids())
      );
$$;

COMMENT ON FUNCTION app.caller_can_manage_attendance_schedule(uuid, uuid) IS
  'True if caller can manage the classroom or course that owns an attendance schedule.';

-- -----------------------------------------------------------------------------
-- Schedule management
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_classroom_attendance_schedule(
  p_classroom_id uuid,
  p_course_id uuid,
  p_days_of_week smallint [],
  p_start_time time,
  p_end_time time,
  p_timezone text,
  p_active_from date DEFAULT (now()::date),
  p_active_until date DEFAULT NULL,
  p_is_active boolean DEFAULT TRUE
)
RETURNS public.classroom_attendance_schedules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  classroom_row public.classrooms%ROWTYPE;
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
BEGIN
  SELECT *
  INTO classroom_row
  FROM public.classrooms
  WHERE id = p_classroom_id;

  IF classroom_row.id IS NULL THEN
    RAISE EXCEPTION 'classroom not found';
  END IF;

  IF NOT app.caller_can_manage_attendance_schedule(p_classroom_id, p_course_id) THEN
    RAISE EXCEPTION 'caller cannot manage attendance schedules';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.classroom_course_links classroom_course_link_row
    WHERE classroom_course_link_row.classroom_id = p_classroom_id
      AND classroom_course_link_row.course_id = p_course_id
      AND classroom_course_link_row.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'course is not linked to classroom';
  END IF;

  INSERT INTO public.classroom_attendance_schedules (
    institution_id,
    classroom_id,
    course_id,
    days_of_week,
    start_time,
    end_time,
    timezone,
    active_from,
    active_until,
    is_active,
    created_by
  )
  VALUES (
    classroom_row.institution_id,
    p_classroom_id,
    p_course_id,
    p_days_of_week,
    p_start_time,
    p_end_time,
    p_timezone,
    p_active_from,
    p_active_until,
    p_is_active,
    (SELECT app.auth_uid())
  )
  RETURNING *
  INTO schedule_row;

  RETURN schedule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.create_classroom_attendance_schedule(uuid, uuid, smallint [], time, time, text, date, date, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.create_classroom_attendance_schedule(uuid, uuid, smallint [], time, time, text, date, date, boolean) TO authenticated;

COMMENT ON FUNCTION public.create_classroom_attendance_schedule(uuid, uuid, smallint [], time, time, text, date, date, boolean) IS
  'Creates a teacher-managed recurring attendance schedule for a classroom course.';

CREATE OR REPLACE FUNCTION public.update_classroom_attendance_schedule(
  p_schedule_id uuid,
  p_days_of_week smallint [] DEFAULT NULL,
  p_start_time time DEFAULT NULL,
  p_end_time time DEFAULT NULL,
  p_timezone text DEFAULT NULL,
  p_active_from date DEFAULT NULL,
  p_active_until date DEFAULT NULL,
  p_clear_active_until boolean DEFAULT FALSE,
  p_is_active boolean DEFAULT NULL
)
RETURNS public.classroom_attendance_schedules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
BEGIN
  SELECT *
  INTO schedule_row
  FROM public.classroom_attendance_schedules
  WHERE id = p_schedule_id;

  IF schedule_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule not found';
  END IF;

  IF NOT app.caller_can_manage_attendance_schedule(schedule_row.classroom_id, schedule_row.course_id) THEN
    RAISE EXCEPTION 'caller cannot update attendance schedule';
  END IF;

  UPDATE public.classroom_attendance_schedules
  SET
    days_of_week = COALESCE(p_days_of_week, schedule_row.days_of_week),
    start_time = COALESCE(p_start_time, schedule_row.start_time),
    end_time = COALESCE(p_end_time, schedule_row.end_time),
    timezone = COALESCE(p_timezone, schedule_row.timezone),
    active_from = COALESCE(p_active_from, schedule_row.active_from),
    active_until = CASE
      WHEN p_clear_active_until THEN NULL
      ELSE COALESCE(p_active_until, schedule_row.active_until)
    END,
    is_active = COALESCE(p_is_active, schedule_row.is_active),
    updated_at = now()
  WHERE id = p_schedule_id
  RETURNING *
  INTO schedule_row;

  RETURN schedule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.update_classroom_attendance_schedule(uuid, smallint [], time, time, text, date, date, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.update_classroom_attendance_schedule(uuid, smallint [], time, time, text, date, date, boolean, boolean) TO authenticated;

COMMENT ON FUNCTION public.update_classroom_attendance_schedule(uuid, smallint [], time, time, text, date, date, boolean, boolean) IS
  'Updates a recurring attendance schedule.';

CREATE OR REPLACE FUNCTION public.archive_classroom_attendance_schedule(
  p_schedule_id uuid
)
RETURNS public.classroom_attendance_schedules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
BEGIN
  SELECT *
  INTO schedule_row
  FROM public.classroom_attendance_schedules
  WHERE id = p_schedule_id;

  IF schedule_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule not found';
  END IF;

  IF NOT app.caller_can_manage_attendance_schedule(schedule_row.classroom_id, schedule_row.course_id) THEN
    RAISE EXCEPTION 'caller cannot archive attendance schedule';
  END IF;

  DELETE FROM public.classroom_attendance_sessions attendance_session_row
  WHERE attendance_session_row.schedule_id = p_schedule_id
    AND attendance_session_row.session_date >= current_date
    AND NOT EXISTS (
      SELECT 1
      FROM public.classroom_attendance_records attendance_record_row
      WHERE attendance_record_row.attendance_session_id = attendance_session_row.id
    );

  UPDATE public.classroom_attendance_schedules
  SET
    is_active = false,
    active_until = CASE
      WHEN active_until IS NULL OR active_until > now()::date THEN now()::date
      ELSE active_until
    END,
    updated_at = now()
  WHERE id = p_schedule_id
  RETURNING *
  INTO schedule_row;

  RETURN schedule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.archive_classroom_attendance_schedule(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.archive_classroom_attendance_schedule(uuid) TO authenticated;

COMMENT ON FUNCTION public.archive_classroom_attendance_schedule(uuid) IS
  'Archives a recurring attendance schedule so no future sessions are generated.';

-- -----------------------------------------------------------------------------
-- Schedule exceptions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_classroom_attendance_schedule_exception(
  p_schedule_id uuid,
  p_exception_date date,
  p_exception_type text,
  p_override_start_time time DEFAULT NULL,
  p_override_end_time time DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS public.classroom_attendance_schedule_exceptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
  exception_row public.classroom_attendance_schedule_exceptions%ROWTYPE;
BEGIN
  SELECT *
  INTO schedule_row
  FROM public.classroom_attendance_schedules
  WHERE id = p_schedule_id;

  IF schedule_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule not found';
  END IF;

  IF NOT app.caller_can_manage_attendance_schedule(schedule_row.classroom_id, schedule_row.course_id) THEN
    RAISE EXCEPTION 'caller cannot manage attendance schedule exceptions';
  END IF;

  INSERT INTO public.classroom_attendance_schedule_exceptions (
    institution_id,
    schedule_id,
    exception_date,
    exception_type,
    override_start_time,
    override_end_time,
    note,
    created_by
  )
  VALUES (
    schedule_row.institution_id,
    p_schedule_id,
    p_exception_date,
    p_exception_type,
    CASE WHEN p_exception_type = 'override' THEN p_override_start_time ELSE NULL END,
    CASE WHEN p_exception_type = 'override' THEN p_override_end_time ELSE NULL END,
    p_note,
    (SELECT app.auth_uid())
  )
  ON CONFLICT (schedule_id, exception_date)
  DO UPDATE
  SET
    institution_id = EXCLUDED.institution_id,
    exception_type = EXCLUDED.exception_type,
    override_start_time = EXCLUDED.override_start_time,
    override_end_time = EXCLUDED.override_end_time,
    note = EXCLUDED.note,
    updated_at = now()
  RETURNING *
  INTO exception_row;

  RETURN exception_row;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_classroom_attendance_schedule_exception(uuid, date, text, time, time, text) FROM public;
GRANT EXECUTE ON FUNCTION public.upsert_classroom_attendance_schedule_exception(uuid, date, text, time, time, text) TO authenticated;

COMMENT ON FUNCTION public.upsert_classroom_attendance_schedule_exception(uuid, date, text, time, time, text) IS
  'Creates or updates a skip/override exception for a recurring attendance schedule.';

CREATE OR REPLACE FUNCTION public.delete_classroom_attendance_schedule_exception(
  p_exception_id uuid
)
RETURNS public.classroom_attendance_schedule_exceptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  exception_row public.classroom_attendance_schedule_exceptions%ROWTYPE;
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
BEGIN
  SELECT *
  INTO exception_row
  FROM public.classroom_attendance_schedule_exceptions
  WHERE id = p_exception_id;

  IF exception_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule exception not found';
  END IF;

  SELECT *
  INTO schedule_row
  FROM public.classroom_attendance_schedules
  WHERE id = exception_row.schedule_id;

  IF schedule_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule not found';
  END IF;

  IF NOT app.caller_can_manage_attendance_schedule(schedule_row.classroom_id, schedule_row.course_id) THEN
    RAISE EXCEPTION 'caller cannot remove attendance schedule exception';
  END IF;

  DELETE FROM public.classroom_attendance_schedule_exceptions
  WHERE id = p_exception_id;

  RETURN exception_row;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_classroom_attendance_schedule_exception(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.delete_classroom_attendance_schedule_exception(uuid) TO authenticated;

COMMENT ON FUNCTION public.delete_classroom_attendance_schedule_exception(uuid) IS
  'Removes a recurring attendance schedule exception.';

-- -----------------------------------------------------------------------------
-- Session materialization
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reconcile_classroom_attendance_sessions(
  p_schedule_id uuid,
  p_from_date date,
  p_to_date date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
  affected_rows integer := 0;
  deleted_rows integer := 0;
BEGIN
  SELECT *
  INTO schedule_row
  FROM public.classroom_attendance_schedules
  WHERE id = p_schedule_id;

  IF schedule_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule not found';
  END IF;

  IF schedule_row.is_active IS NOT TRUE THEN
    RETURN 0;
  END IF;

  IF p_from_date IS NULL OR p_to_date IS NULL THEN
    RAISE EXCEPTION 'materialization date range is required';
  END IF;

  IF p_to_date < p_from_date THEN
    RAISE EXCEPTION 'materialization end date must be greater than or equal to start date';
  END IF;

  WITH target_dates AS (
    SELECT gs::date AS session_date
    FROM generate_series(
      GREATEST(p_from_date, schedule_row.active_from),
      LEAST(p_to_date, COALESCE(schedule_row.active_until, p_to_date)),
      interval '1 day'
    ) AS gs
  ),
  desired_sessions AS (
    SELECT
      schedule_row.id AS schedule_id,
      schedule_row.institution_id,
      schedule_row.classroom_id,
      schedule_row.course_id,
      target_dates.session_date,
      CASE
        WHEN schedule_exception_row.exception_type = 'override' THEN ((target_dates.session_date::timestamp + schedule_exception_row.override_start_time) AT TIME ZONE schedule_row.timezone)
        ELSE ((target_dates.session_date::timestamp + schedule_row.start_time) AT TIME ZONE schedule_row.timezone)
      END AS starts_at,
      CASE
        WHEN schedule_exception_row.exception_type = 'override' THEN ((target_dates.session_date::timestamp + schedule_exception_row.override_end_time) AT TIME ZONE schedule_row.timezone)
        ELSE ((target_dates.session_date::timestamp + schedule_row.end_time) AT TIME ZONE schedule_row.timezone)
      END AS ends_at,
      schedule_exception_row.id AS schedule_exception_id
    FROM target_dates
    LEFT JOIN public.classroom_attendance_schedule_exceptions schedule_exception_row
      ON schedule_exception_row.schedule_id = schedule_row.id
     AND schedule_exception_row.exception_date = target_dates.session_date
    WHERE (
      schedule_exception_row.exception_type = 'override'
      OR (
        schedule_exception_row.id IS NULL
        AND EXTRACT(ISODOW FROM target_dates.session_date)::smallint = ANY(schedule_row.days_of_week)
      )
    )
  )
  INSERT INTO public.classroom_attendance_sessions (
    institution_id,
    classroom_id,
    course_id,
    schedule_id,
    schedule_exception_id,
    session_date,
    starts_at,
    ends_at,
    created_by
  )
  SELECT
    desired_sessions.institution_id,
    desired_sessions.classroom_id,
    desired_sessions.course_id,
    desired_sessions.schedule_id,
    desired_sessions.schedule_exception_id,
    desired_sessions.session_date,
    desired_sessions.starts_at,
    desired_sessions.ends_at,
    schedule_row.created_by
  FROM desired_sessions
  ON CONFLICT (schedule_id, session_date)
  DO UPDATE
  SET
    institution_id = EXCLUDED.institution_id,
    classroom_id = EXCLUDED.classroom_id,
    course_id = EXCLUDED.course_id,
    schedule_exception_id = EXCLUDED.schedule_exception_id,
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at,
    updated_at = now()
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.classroom_attendance_records attendance_record_row
    WHERE attendance_record_row.attendance_session_id = public.classroom_attendance_sessions.id
  );

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  WITH target_dates AS (
    SELECT gs::date AS session_date
    FROM generate_series(
      GREATEST(p_from_date, schedule_row.active_from),
      LEAST(p_to_date, COALESCE(schedule_row.active_until, p_to_date)),
      interval '1 day'
    ) AS gs
  ),
  desired_sessions AS (
    SELECT target_dates.session_date
    FROM target_dates
    LEFT JOIN public.classroom_attendance_schedule_exceptions schedule_exception_row
      ON schedule_exception_row.schedule_id = schedule_row.id
     AND schedule_exception_row.exception_date = target_dates.session_date
    WHERE (
      schedule_exception_row.exception_type = 'override'
      OR (
        schedule_exception_row.id IS NULL
        AND EXTRACT(ISODOW FROM target_dates.session_date)::smallint = ANY(schedule_row.days_of_week)
      )
    )
  )
  DELETE FROM public.classroom_attendance_sessions attendance_session_row
  WHERE attendance_session_row.schedule_id = p_schedule_id
    AND attendance_session_row.session_date BETWEEN p_from_date AND p_to_date
    AND NOT EXISTS (
      SELECT 1
      FROM desired_sessions
      WHERE desired_sessions.session_date = attendance_session_row.session_date
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.classroom_attendance_records attendance_record_row
      WHERE attendance_record_row.attendance_session_id = attendance_session_row.id
    );

  GET DIAGNOSTICS deleted_rows = ROW_COUNT;

  RETURN affected_rows + deleted_rows;
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_classroom_attendance_sessions(uuid, date, date) FROM public;

COMMENT ON FUNCTION public.reconcile_classroom_attendance_sessions(uuid, date, date) IS
  'Internal helper that reconciles generated attendance sessions for a schedule and date range.';

CREATE OR REPLACE FUNCTION public.materialize_classroom_attendance_sessions(
  p_schedule_id uuid,
  p_from_date date,
  p_to_date date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
BEGIN
  SELECT *
  INTO schedule_row
  FROM public.classroom_attendance_schedules
  WHERE id = p_schedule_id;

  IF schedule_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule not found';
  END IF;

  IF NOT app.caller_can_manage_attendance_schedule(schedule_row.classroom_id, schedule_row.course_id) THEN
    RAISE EXCEPTION 'caller cannot manage attendance schedule materialization';
  END IF;

  RETURN public.reconcile_classroom_attendance_sessions(p_schedule_id, p_from_date, p_to_date);
END;
$$;

REVOKE ALL ON FUNCTION public.materialize_classroom_attendance_sessions(uuid, date, date) FROM public;
GRANT EXECUTE ON FUNCTION public.materialize_classroom_attendance_sessions(uuid, date, date) TO authenticated;

COMMENT ON FUNCTION public.materialize_classroom_attendance_sessions(uuid, date, date) IS
  'Materializes recurring attendance sessions for a schedule and date range.';
