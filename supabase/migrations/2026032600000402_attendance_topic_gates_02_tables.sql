-- =============================================================================
-- ATTENDANCE + TOPIC GATES — tables
-- Requires: 20260326000004_attendance_topic_gates_01_types
-- =============================================================================

-- =============================================================================
-- classroom_attendance_sessions
-- =============================================================================
CREATE TABLE public.classroom_attendance_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title text,
  session_date date NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_classroom_attendance_sessions_classroom
    FOREIGN KEY (classroom_id, institution_id)
    REFERENCES public.classrooms (id, institution_id)
    ON DELETE CASCADE
);

COMMENT ON TABLE public.classroom_attendance_sessions IS
  'One attendance roll-call window for a classroom-course meeting.';
COMMENT ON COLUMN public.classroom_attendance_sessions.institution_id IS
  'Tenant boundary key.';
COMMENT ON COLUMN public.classroom_attendance_sessions.classroom_id IS
  'Classroom where attendance is recorded.';
COMMENT ON COLUMN public.classroom_attendance_sessions.course_id IS
  'Course delivered in this attendance session.';
COMMENT ON COLUMN public.classroom_attendance_sessions.session_date IS
  'Calendar date for the lesson session.';
COMMENT ON COLUMN public.classroom_attendance_sessions.starts_at IS
  'Session start timestamp used to classify late check-ins.';
COMMENT ON COLUMN public.classroom_attendance_sessions.ends_at IS
  'Session end timestamp; NULL means session is open.';

-- =============================================================================
-- classroom_attendance_records
-- =============================================================================
CREATE TABLE public.classroom_attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  attendance_session_id uuid NOT NULL REFERENCES public.classroom_attendance_sessions (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  status public.attendance_status NOT NULL,
  source public.attendance_source NOT NULL DEFAULT 'manual',
  check_in_time timestamptz,
  check_out_time timestamptz,
  note text,
  created_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  updated_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_classroom_attendance_records_session_student
    UNIQUE (attendance_session_id, student_id),
  CONSTRAINT chk_classroom_attendance_records_time_order
    CHECK (check_out_time IS NULL OR check_in_time IS NULL OR check_out_time >= check_in_time)
);

COMMENT ON TABLE public.classroom_attendance_records IS
  'Per-student attendance result for one attendance session.';
COMMENT ON COLUMN public.classroom_attendance_records.attendance_session_id IS
  'Parent attendance session.';
COMMENT ON COLUMN public.classroom_attendance_records.student_id IS
  'Student user identifier for this attendance record.';
COMMENT ON COLUMN public.classroom_attendance_records.status IS
  'Attendance status: present, late, absent.';
COMMENT ON COLUMN public.classroom_attendance_records.source IS
  'Write source: manual, self_check_in, auto.';
COMMENT ON COLUMN public.classroom_attendance_records.check_in_time IS
  'Recorded check-in timestamp.';
COMMENT ON COLUMN public.classroom_attendance_records.check_out_time IS
  'Recorded check-out timestamp.';

-- =============================================================================
-- topic_availability_rules
-- =============================================================================
CREATE TABLE public.topic_availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES public.topics (id) ON DELETE CASCADE,
  is_locked boolean NOT NULL DEFAULT FALSE,
  unlock_at timestamptz,
  unlocked_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  unlocked_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_topic_availability_rules_course_topic UNIQUE (course_id, topic_id)
);

COMMENT ON TABLE public.topic_availability_rules IS
  'Course-topic lock rules that prevent fast-forward access before unlock conditions.';
COMMENT ON COLUMN public.topic_availability_rules.course_id IS
  'Course containing the topic.';
COMMENT ON COLUMN public.topic_availability_rules.topic_id IS
  'Topic governed by this availability rule.';
COMMENT ON COLUMN public.topic_availability_rules.is_locked IS
  'True blocks student access unless unlocked by time or teacher action.';
COMMENT ON COLUMN public.topic_availability_rules.unlock_at IS
  'Scheduled unlock timestamp; when reached, topic can become available.';
COMMENT ON COLUMN public.topic_availability_rules.unlocked_by IS
  'Teacher/admin user that explicitly unlocked the topic.';
COMMENT ON COLUMN public.topic_availability_rules.unlocked_at IS
  'Timestamp when topic was manually or automatically unlocked.';
