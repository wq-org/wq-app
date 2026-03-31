-- =============================================================================
-- ATTENDANCE + TOPIC GATES — types
-- Requires: 20260321000002_institution_admin (all parts),
--           20260323000002_classroom_course_links_lesson_progress (all parts)
-- =============================================================================

DO $$
BEGIN
  CREATE TYPE public.attendance_status AS ENUM ('present', 'late', 'absent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.attendance_status IS
  'Attendance state per student for a class session.';

DO $$
BEGIN
  CREATE TYPE public.attendance_source AS ENUM ('manual', 'self_check_in', 'auto');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.attendance_source IS
  'How an attendance record was created or updated.';
