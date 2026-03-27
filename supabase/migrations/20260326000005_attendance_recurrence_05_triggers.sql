-- =============================================================================
-- ATTENDANCE RECURRING SCHEDULES — triggers
-- Requires: 20260326000005_attendance_recurrence_04_backfills_seed
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Validation helpers
-- -----------------------------------------------------------------------------
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
    FROM public.classroom_course_links classroom_course_link_row
    WHERE classroom_course_link_row.classroom_id = NEW.classroom_id
      AND classroom_course_link_row.course_id = NEW.course_id
      AND classroom_course_link_row.deleted_at IS NULL
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

REVOKE ALL ON FUNCTION public.validate_classroom_attendance_schedule() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.validate_classroom_attendance_schedule_exception()
RETURNS trigger
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
  WHERE id = NEW.schedule_id;

  IF schedule_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance schedule not found';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM schedule_row.institution_id THEN
    RAISE EXCEPTION 'attendance schedule exception institution must match schedule institution';
  END IF;

  IF NEW.exception_type = 'skip' THEN
    NEW.override_start_time := NULL;
    NEW.override_end_time := NULL;
  END IF;

  IF NEW.exception_type = 'override' THEN
    IF NEW.override_start_time IS NULL OR NEW.override_end_time IS NULL THEN
      RAISE EXCEPTION 'override attendance exception requires start and end time';
    END IF;

    IF NEW.override_end_time <= NEW.override_start_time THEN
      RAISE EXCEPTION 'override attendance exception end time must be after start time';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_classroom_attendance_schedule_exception() FROM PUBLIC;

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
    FROM public.classroom_course_links classroom_course_link_row
    WHERE classroom_course_link_row.classroom_id = NEW.classroom_id
      AND classroom_course_link_row.course_id = NEW.course_id
      AND classroom_course_link_row.deleted_at IS NULL
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

REVOKE ALL ON FUNCTION public.validate_classroom_attendance_session() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.sync_classroom_attendance_schedule_sessions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  schedule_id_value uuid;
  from_date_value date;
  to_date_value date;
BEGIN
  IF TG_TABLE_NAME = 'classroom_attendance_schedules' THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;

    schedule_id_value := NEW.id;
    IF TG_OP = 'INSERT' THEN
      from_date_value := NEW.active_from;
      to_date_value := COALESCE(NEW.active_until, (current_date + 365));
    ELSE
      from_date_value := LEAST(OLD.active_from, NEW.active_from);
      to_date_value := GREATEST(
        COALESCE(OLD.active_until, (current_date + 365)),
        COALESCE(NEW.active_until, (current_date + 365))
      );
    END IF;

    IF NEW.is_active IS TRUE THEN
      PERFORM public.reconcile_classroom_attendance_sessions(schedule_id_value, from_date_value, to_date_value);
    END IF;

    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'classroom_attendance_schedule_exceptions' THEN
    IF TG_OP = 'INSERT' THEN
      schedule_id_value := NEW.schedule_id;
      from_date_value := NEW.exception_date;
      to_date_value := NEW.exception_date;
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.schedule_id IS DISTINCT FROM NEW.schedule_id THEN
        IF OLD.schedule_id IS NOT NULL THEN
          PERFORM public.reconcile_classroom_attendance_sessions(OLD.schedule_id, OLD.exception_date, OLD.exception_date);
        END IF;
        IF NEW.schedule_id IS NOT NULL THEN
          PERFORM public.reconcile_classroom_attendance_sessions(NEW.schedule_id, NEW.exception_date, NEW.exception_date);
        END IF;
        RETURN NEW;
      END IF;

      schedule_id_value := NEW.schedule_id;
      from_date_value := LEAST(OLD.exception_date, NEW.exception_date);
      to_date_value := GREATEST(OLD.exception_date, NEW.exception_date);
    ELSE
      schedule_id_value := OLD.schedule_id;
      from_date_value := OLD.exception_date;
      to_date_value := OLD.exception_date;

      IF NOT EXISTS (
        SELECT 1
        FROM public.classroom_attendance_schedules schedule_row
        WHERE schedule_row.id = schedule_id_value
      ) THEN
        RETURN OLD;
      END IF;
    END IF;

    IF schedule_id_value IS NOT NULL AND from_date_value IS NOT NULL AND to_date_value IS NOT NULL THEN
      PERFORM public.reconcile_classroom_attendance_sessions(schedule_id_value, from_date_value, to_date_value);
    END IF;

    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_classroom_attendance_schedule_sessions() FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS classroom_attendance_schedules_set_updated_at ON public.classroom_attendance_schedules;
DROP TRIGGER IF EXISTS trg_classroom_attendance_schedules_set_updated_at ON public.classroom_attendance_schedules;
CREATE TRIGGER trg_classroom_attendance_schedules_set_updated_at
  BEFORE UPDATE ON public.classroom_attendance_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS classroom_attendance_schedule_exceptions_set_updated_at ON public.classroom_attendance_schedule_exceptions;
DROP TRIGGER IF EXISTS trg_classroom_attendance_schedule_exceptions_set_updated_at ON public.classroom_attendance_schedule_exceptions;
CREATE TRIGGER trg_classroom_attendance_schedule_exceptions_set_updated_at
  BEFORE UPDATE ON public.classroom_attendance_schedule_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- validation triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS classroom_attendance_schedules_validate ON public.classroom_attendance_schedules;
DROP TRIGGER IF EXISTS trg_classroom_attendance_schedules_validate ON public.classroom_attendance_schedules;
CREATE TRIGGER trg_classroom_attendance_schedules_validate
  BEFORE INSERT OR UPDATE ON public.classroom_attendance_schedules
  FOR EACH ROW EXECUTE FUNCTION public.validate_classroom_attendance_schedule();

DROP TRIGGER IF EXISTS classroom_attendance_schedule_exceptions_validate ON public.classroom_attendance_schedule_exceptions;
DROP TRIGGER IF EXISTS trg_classroom_attendance_schedule_exceptions_validate ON public.classroom_attendance_schedule_exceptions;
CREATE TRIGGER trg_classroom_attendance_schedule_exceptions_validate
  BEFORE INSERT OR UPDATE ON public.classroom_attendance_schedule_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.validate_classroom_attendance_schedule_exception();

DROP TRIGGER IF EXISTS classroom_attendance_sessions_validate ON public.classroom_attendance_sessions;
DROP TRIGGER IF EXISTS trg_classroom_attendance_sessions_validate ON public.classroom_attendance_sessions;
CREATE TRIGGER trg_classroom_attendance_sessions_validate
  BEFORE INSERT OR UPDATE ON public.classroom_attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_classroom_attendance_session();

-- -----------------------------------------------------------------------------
-- schedule materialization triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS classroom_attendance_schedules_materialize ON public.classroom_attendance_schedules;
DROP TRIGGER IF EXISTS trg_classroom_attendance_schedules_materialize ON public.classroom_attendance_schedules;
CREATE TRIGGER trg_classroom_attendance_schedules_materialize
  AFTER INSERT OR UPDATE ON public.classroom_attendance_schedules
  FOR EACH ROW EXECUTE FUNCTION public.sync_classroom_attendance_schedule_sessions();

DROP TRIGGER IF EXISTS classroom_attendance_schedule_exceptions_materialize ON public.classroom_attendance_schedule_exceptions;
DROP TRIGGER IF EXISTS trg_classroom_attendance_schedule_exceptions_materialize ON public.classroom_attendance_schedule_exceptions;
CREATE TRIGGER trg_classroom_attendance_schedule_exceptions_materialize
  AFTER INSERT OR UPDATE OR DELETE ON public.classroom_attendance_schedule_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_classroom_attendance_schedule_sessions();
