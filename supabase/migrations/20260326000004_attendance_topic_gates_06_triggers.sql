-- =============================================================================
-- ATTENDANCE + TOPIC GATES — triggers
-- Requires: 20260326000004_attendance_topic_gates_05_backfills_seed
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger functions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_classroom_attendance_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  classroom_row public.classrooms%ROWTYPE;
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

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_classroom_attendance_session() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.validate_classroom_attendance_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  attendance_session_row public.classroom_attendance_sessions%ROWTYPE;
BEGIN
  SELECT *
  INTO attendance_session_row
  FROM public.classroom_attendance_sessions
  WHERE id = NEW.attendance_session_id;

  IF attendance_session_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance session not found';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM attendance_session_row.institution_id THEN
    RAISE EXCEPTION 'attendance record institution must match attendance session institution';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.classroom_members classroom_member_row
    WHERE classroom_member_row.classroom_id = attendance_session_row.classroom_id
      AND classroom_member_row.user_id = NEW.student_id
      AND classroom_member_row.withdrawn_at IS NULL
      AND classroom_member_row.membership_role = 'student'::public.classroom_member_role
  ) THEN
    RAISE EXCEPTION 'attendance record student must be an active classroom student';
  END IF;

  IF NEW.source = 'self_check_in'::public.attendance_source
    AND NEW.student_id IS DISTINCT FROM (SELECT app.auth_uid()) THEN
    RAISE EXCEPTION 'self_check_in source can only be written by the student';
  END IF;

  IF NEW.check_in_time IS NULL AND NEW.status IN ('present', 'late') THEN
    NEW.check_in_time := now();
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_classroom_attendance_record() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.normalize_topic_availability_rule()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  topic_row public.topics%ROWTYPE;
  course_row public.courses%ROWTYPE;
BEGIN
  SELECT *
  INTO topic_row
  FROM public.topics
  WHERE id = NEW.topic_id;

  IF topic_row.id IS NULL THEN
    RAISE EXCEPTION 'topic not found';
  END IF;

  IF topic_row.course_id IS DISTINCT FROM NEW.course_id THEN
    RAISE EXCEPTION 'topic_availability_rules.course_id must match topics.course_id';
  END IF;

  SELECT *
  INTO course_row
  FROM public.courses
  WHERE id = NEW.course_id;

  IF course_row.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM course_row.institution_id THEN
    RAISE EXCEPTION 'topic availability institution must match course institution';
  END IF;

  IF NEW.is_locked = false THEN
    IF NEW.unlocked_at IS NULL THEN
      NEW.unlocked_at := now();
    END IF;
    IF NEW.unlocked_by IS NULL THEN
      NEW.unlocked_by := (SELECT app.auth_uid());
    END IF;
    NEW.unlock_at := NULL;
  END IF;

  IF NEW.unlock_at IS NOT NULL AND NEW.unlock_at <= now() THEN
    NEW.is_locked := false;
    NEW.unlocked_at := COALESCE(NEW.unlocked_at, now());
    NEW.unlocked_by := COALESCE(NEW.unlocked_by, (SELECT app.auth_uid()));
    NEW.unlock_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_topic_availability_rule() FROM PUBLIC;

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS classroom_attendance_sessions_set_updated_at ON public.classroom_attendance_sessions;
DROP TRIGGER IF EXISTS trg_classroom_attendance_sessions_set_updated_at ON public.classroom_attendance_sessions;
CREATE TRIGGER trg_classroom_attendance_sessions_set_updated_at
  BEFORE UPDATE ON public.classroom_attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS classroom_attendance_records_set_updated_at ON public.classroom_attendance_records;
DROP TRIGGER IF EXISTS trg_classroom_attendance_records_set_updated_at ON public.classroom_attendance_records;
CREATE TRIGGER trg_classroom_attendance_records_set_updated_at
  BEFORE UPDATE ON public.classroom_attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS topic_availability_rules_set_updated_at ON public.topic_availability_rules;
DROP TRIGGER IF EXISTS trg_topic_availability_rules_set_updated_at ON public.topic_availability_rules;
CREATE TRIGGER trg_topic_availability_rules_set_updated_at
  BEFORE UPDATE ON public.topic_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- integrity triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS classroom_attendance_sessions_validate ON public.classroom_attendance_sessions;
DROP TRIGGER IF EXISTS trg_classroom_attendance_sessions_validate ON public.classroom_attendance_sessions;
CREATE TRIGGER trg_classroom_attendance_sessions_validate
  BEFORE INSERT OR UPDATE ON public.classroom_attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.validate_classroom_attendance_session();

DROP TRIGGER IF EXISTS classroom_attendance_records_validate ON public.classroom_attendance_records;
DROP TRIGGER IF EXISTS trg_classroom_attendance_records_validate ON public.classroom_attendance_records;
CREATE TRIGGER trg_classroom_attendance_records_validate
  BEFORE INSERT OR UPDATE ON public.classroom_attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.validate_classroom_attendance_record();

DROP TRIGGER IF EXISTS topic_availability_rules_normalize ON public.topic_availability_rules;
DROP TRIGGER IF EXISTS trg_topic_availability_rules_normalize ON public.topic_availability_rules;
CREATE TRIGGER trg_topic_availability_rules_normalize
  BEFORE INSERT OR UPDATE ON public.topic_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.normalize_topic_availability_rule();

-- -----------------------------------------------------------------------------
-- audit triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_classroom_attendance_sessions_audit_row ON public.classroom_attendance_sessions;
CREATE TRIGGER trg_classroom_attendance_sessions_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.classroom_attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION audit.log_classroom_attendance_sessions_audit();

DROP TRIGGER IF EXISTS trg_classroom_attendance_records_audit_row ON public.classroom_attendance_records;
CREATE TRIGGER trg_classroom_attendance_records_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.classroom_attendance_records
  FOR EACH ROW EXECUTE FUNCTION audit.log_classroom_attendance_records_audit();
