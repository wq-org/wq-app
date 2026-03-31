-- =============================================================================
-- ATTENDANCE + TOPIC GATES — indexes & constraints
-- Requires: 20260326000004_attendance_topic_gates_02_tables
-- =============================================================================

-- attendance sessions
CREATE INDEX IF NOT EXISTS idx_classroom_attendance_sessions_institution_id
  ON public.classroom_attendance_sessions (institution_id);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_sessions_classroom_id_course_id_session_date
  ON public.classroom_attendance_sessions (classroom_id, course_id, session_date DESC);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_sessions_starts_at
  ON public.classroom_attendance_sessions (starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_sessions_open
  ON public.classroom_attendance_sessions (classroom_id, course_id, starts_at DESC)
  WHERE ends_at IS NULL;

-- attendance records
CREATE INDEX IF NOT EXISTS idx_classroom_attendance_records_institution_id
  ON public.classroom_attendance_records (institution_id);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_records_session_id
  ON public.classroom_attendance_records (attendance_session_id);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_records_student_id
  ON public.classroom_attendance_records (student_id);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_records_status
  ON public.classroom_attendance_records (status);

CREATE INDEX IF NOT EXISTS idx_classroom_attendance_records_session_status
  ON public.classroom_attendance_records (attendance_session_id, status);

-- topic availability rules
CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_institution_id
  ON public.topic_availability_rules (institution_id);

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_course_id
  ON public.topic_availability_rules (course_id);

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_topic_id
  ON public.topic_availability_rules (topic_id);

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_unlock_at
  ON public.topic_availability_rules (unlock_at)
  WHERE unlock_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_topic_availability_rules_locked
  ON public.topic_availability_rules (course_id, is_locked, unlock_at);
