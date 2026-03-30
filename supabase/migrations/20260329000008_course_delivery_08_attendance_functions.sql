-- =============================================================================
-- COURSE DELIVERY — attendance + schedules validate against course_deliveries
-- Requires: 20260329000004_course_delivery_04_backfill_versions_deliveries.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_classroom_attendance_session(
  p_classroom_id uuid,
  p_course_id uuid,
  p_title text DEFAULT NULL,
  p_session_date date DEFAULT (now()::date),
  p_starts_at timestamptz DEFAULT now(),
  p_ends_at timestamptz DEFAULT NULL
)
RETURNS public.classroom_attendance_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  classroom_row public.classrooms%ROWTYPE;
  created_session_row public.classroom_attendance_sessions%ROWTYPE;
BEGIN
  SELECT *
  INTO classroom_row
  FROM public.classrooms
  WHERE id = p_classroom_id;

  IF classroom_row.id IS NULL THEN
    RAISE EXCEPTION 'classroom not found';
  END IF;

  IF NOT app.caller_can_manage_classroom(p_classroom_id) THEN
    RAISE EXCEPTION 'caller cannot manage classroom attendance';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.course_deliveries course_delivery_row
    WHERE course_delivery_row.classroom_id = p_classroom_id
      AND course_delivery_row.course_id = p_course_id
      AND course_delivery_row.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'course is not linked to classroom';
  END IF;

  INSERT INTO public.classroom_attendance_sessions (
    institution_id,
    classroom_id,
    course_id,
    title,
    session_date,
    starts_at,
    ends_at,
    created_by
  )
  VALUES (
    classroom_row.institution_id,
    p_classroom_id,
    p_course_id,
    p_title,
    p_session_date,
    p_starts_at,
    p_ends_at,
    (SELECT app.auth_uid())
  )
  RETURNING *
  INTO created_session_row;

  RETURN created_session_row;
END;
$$;

REVOKE ALL ON FUNCTION public.create_classroom_attendance_session(uuid, uuid, text, date, timestamptz, timestamptz) FROM public;
GRANT EXECUTE ON FUNCTION public.create_classroom_attendance_session(uuid, uuid, text, date, timestamptz, timestamptz) TO authenticated;

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
    FROM public.course_deliveries course_delivery_row
    WHERE course_delivery_row.classroom_id = p_classroom_id
      AND course_delivery_row.course_id = p_course_id
      AND course_delivery_row.deleted_at IS NULL
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

CREATE OR REPLACE FUNCTION public.validate_classroom_attendance_schedule()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  classroom_row public.classrooms%ROWTYPE;
  course_row public.courses%ROWTYPE;
BEGIN
  SELECT *
  INTO classroom_row
  FROM public.classrooms
  WHERE id = NEW.classroom_id;

  IF classroom_row.id IS NULL THEN
    RAISE EXCEPTION 'classroom not found';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM classroom_row.institution_id THEN
    RAISE EXCEPTION 'attendance schedule institution must match classroom institution';
  END IF;

  SELECT *
  INTO course_row
  FROM public.courses
  WHERE id = NEW.course_id;

  IF course_row.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  IF course_row.institution_id IS DISTINCT FROM NEW.institution_id THEN
    RAISE EXCEPTION 'attendance schedule institution must match course institution';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.course_deliveries course_delivery_row
    WHERE course_delivery_row.classroom_id = NEW.classroom_id
      AND course_delivery_row.course_id = NEW.course_id
      AND course_delivery_row.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'course is not linked to classroom';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_timezone_names timezone_row
    WHERE timezone_row.name = NEW.timezone
  ) THEN
    RAISE EXCEPTION 'timezone is not valid';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_classroom_attendance_schedule() FROM public;

CREATE OR REPLACE FUNCTION public.validate_classroom_attendance_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  classroom_row public.classrooms%ROWTYPE;
  schedule_row public.classroom_attendance_schedules%ROWTYPE;
  schedule_exception_row public.classroom_attendance_schedule_exceptions%ROWTYPE;
BEGIN
  SELECT *
  INTO classroom_row
  FROM public.classrooms
  WHERE id = NEW.classroom_id;

  IF classroom_row.id IS NULL THEN
    RAISE EXCEPTION 'classroom not found';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM classroom_row.institution_id THEN
    RAISE EXCEPTION 'attendance session institution must match classroom institution';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.course_deliveries course_delivery_row
    WHERE course_delivery_row.classroom_id = NEW.classroom_id
      AND course_delivery_row.course_id = NEW.course_id
      AND course_delivery_row.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'attendance session course must be linked to classroom';
  END IF;

  IF NEW.ends_at IS NOT NULL AND NEW.ends_at < NEW.starts_at THEN
    RAISE EXCEPTION 'attendance session ends_at must be greater than or equal to starts_at';
  END IF;

  IF NEW.schedule_id IS NOT NULL THEN
    SELECT *
    INTO schedule_row
    FROM public.classroom_attendance_schedules
    WHERE id = NEW.schedule_id;

    IF schedule_row.id IS NULL THEN
      RAISE EXCEPTION 'attendance schedule not found';
    END IF;

    IF NEW.schedule_id IS NOT NULL AND schedule_row.institution_id IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'attendance session schedule must match attendance session institution';
    END IF;

    IF schedule_row.classroom_id IS DISTINCT FROM NEW.classroom_id THEN
      RAISE EXCEPTION 'attendance session schedule must match classroom';
    END IF;

    IF schedule_row.course_id IS DISTINCT FROM NEW.course_id THEN
      RAISE EXCEPTION 'attendance session schedule must match course';
    END IF;

    IF NEW.session_date < schedule_row.active_from THEN
      RAISE EXCEPTION 'attendance session date is before schedule start';
    END IF;

    IF schedule_row.active_until IS NOT NULL AND NEW.session_date > schedule_row.active_until THEN
      RAISE EXCEPTION 'attendance session date is after schedule end';
    END IF;

    IF NEW.schedule_exception_id IS NOT NULL THEN
      SELECT *
      INTO schedule_exception_row
      FROM public.classroom_attendance_schedule_exceptions
      WHERE id = NEW.schedule_exception_id;

      IF schedule_exception_row.id IS NULL THEN
        RAISE EXCEPTION 'attendance schedule exception not found';
      END IF;

      IF schedule_exception_row.schedule_id IS DISTINCT FROM NEW.schedule_id THEN
        RAISE EXCEPTION 'attendance session exception must belong to the same schedule';
      END IF;

      IF schedule_exception_row.exception_date IS DISTINCT FROM NEW.session_date THEN
        RAISE EXCEPTION 'attendance session exception date must match session_date';
      END IF;

      IF schedule_exception_row.exception_type = 'skip' THEN
        RAISE EXCEPTION 'skip attendance exceptions do not generate sessions';
      END IF;
    ELSE
      IF EXTRACT(ISODOW FROM NEW.session_date)::smallint <> ALL(schedule_row.days_of_week) THEN
        RAISE EXCEPTION 'attendance session date does not match schedule recurrence';
      END IF;
    END IF;

    IF ((NEW.starts_at AT TIME ZONE schedule_row.timezone)::date) IS DISTINCT FROM NEW.session_date THEN
      RAISE EXCEPTION 'attendance session starts_at must align with session_date in schedule timezone';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_classroom_attendance_session() FROM public;
