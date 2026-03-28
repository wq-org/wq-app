-- =============================================================================
-- ATTENDANCE RECURRING SCHEDULES — indexes & constraints
-- Requires: 20260326000005_attendance_recurrence_01_tables
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_schedules_institution_id
  ON public.classroom_attendance_schedules (institution_id);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_schedules_classroom_id_course_id
  ON public.classroom_attendance_schedules (classroom_id, course_id);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_schedules_is_active
  ON public.classroom_attendance_schedules (is_active, active_from, active_until);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_schedules_days_of_week
  ON public.classroom_attendance_schedules USING gin (days_of_week);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_schedule_exceptions_institution_id
  ON public.classroom_attendance_schedule_exceptions (institution_id);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_schedule_exceptions_schedule_id_exception_date
  ON public.classroom_attendance_schedule_exceptions (schedule_id, exception_date);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_sessions_schedule_id
  ON public.classroom_attendance_sessions (schedule_id)
  WHERE schedule_id IS NOT NULL;
