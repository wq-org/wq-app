-- =============================================================================
-- ATTENDANCE RECURRING SCHEDULES — tables
-- Requires: 20260326000004_attendance_topic_gates (all parts)
-- =============================================================================

-- =============================================================================
-- classroom_attendance_schedules
-- =============================================================================
CREATE TABLE public.classroom_attendance_schedules (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid        NOT NULL,
  course_id       uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  days_of_week    smallint[]  NOT NULL,
  start_time      time        NOT NULL,
  end_time        time        NOT NULL,
  timezone        text        NOT NULL,
  active_from     date        NOT NULL,
  active_until    date,
  is_active       boolean     NOT NULL DEFAULT true,
  created_by      uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_classroom_attendance_schedules_classroom
    FOREIGN KEY (classroom_id, institution_id)
    REFERENCES public.classrooms(id, institution_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_classroom_attendance_schedules_days_of_week
    CHECK (
      COALESCE(array_length(days_of_week, 1), 0) > 0
      AND days_of_week <@ ARRAY[1, 2, 3, 4, 5, 6, 7]::smallint[]
    ),
  CONSTRAINT chk_classroom_attendance_schedules_time_order
    CHECK (end_time > start_time),
  CONSTRAINT chk_classroom_attendance_schedules_active_range
    CHECK (active_until IS NULL OR active_until >= active_from),
  CONSTRAINT chk_classroom_attendance_schedules_timezone
    CHECK (timezone <> '')
);

COMMENT ON TABLE public.classroom_attendance_schedules IS
  'Teacher-managed recurrence rule for classroom attendance sessions.';
COMMENT ON COLUMN public.classroom_attendance_schedules.institution_id IS
  'Tenant boundary key.';
COMMENT ON COLUMN public.classroom_attendance_schedules.classroom_id IS
  'Classroom that owns the recurring attendance rule.';
COMMENT ON COLUMN public.classroom_attendance_schedules.course_id IS
  'Course delivered by this recurring attendance rule.';
COMMENT ON COLUMN public.classroom_attendance_schedules.days_of_week IS
  'ISO weekdays: 1=Mon ... 7=Sun.';
COMMENT ON COLUMN public.classroom_attendance_schedules.start_time IS
  'Local start time in the stored timezone.';
COMMENT ON COLUMN public.classroom_attendance_schedules.end_time IS
  'Local end time in the stored timezone.';
COMMENT ON COLUMN public.classroom_attendance_schedules.timezone IS
  'IANA timezone name used to compute timestamps.';

-- =============================================================================
-- classroom_attendance_schedule_exceptions
-- =============================================================================
CREATE TABLE public.classroom_attendance_schedule_exceptions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id      uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  schedule_id         uuid        NOT NULL REFERENCES public.classroom_attendance_schedules(id) ON DELETE CASCADE,
  exception_date      date        NOT NULL,
  exception_type      text        NOT NULL,
  override_start_time time,
  override_end_time   time,
  note                text,
  created_by          uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE RESTRICT,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_classroom_attendance_schedule_exceptions_schedule_date
    UNIQUE (schedule_id, exception_date),
  CONSTRAINT chk_classroom_attendance_schedule_exceptions_type
    CHECK (exception_type IN ('skip', 'override')),
  CONSTRAINT chk_classroom_attendance_schedule_exceptions_override_window
    CHECK (
      (
        exception_type = 'skip'
        AND override_start_time IS NULL
        AND override_end_time IS NULL
      )
      OR (
        exception_type = 'override'
        AND override_start_time IS NOT NULL
        AND override_end_time IS NOT NULL
        AND override_end_time > override_start_time
      )
    )
);

COMMENT ON TABLE public.classroom_attendance_schedule_exceptions IS
  'Date-level override for a recurring classroom attendance schedule.';
COMMENT ON COLUMN public.classroom_attendance_schedule_exceptions.exception_date IS
  'Date that is skipped or overridden.';
COMMENT ON COLUMN public.classroom_attendance_schedule_exceptions.exception_type IS
  'skip removes the session; override replaces the base time window.';
COMMENT ON COLUMN public.classroom_attendance_schedule_exceptions.override_start_time IS
  'Override start time used only for exception_type = override.';
COMMENT ON COLUMN public.classroom_attendance_schedule_exceptions.override_end_time IS
  'Override end time used only for exception_type = override.';

-- =============================================================================
-- classroom_attendance_sessions extensions
-- =============================================================================
ALTER TABLE public.classroom_attendance_sessions
  ADD COLUMN IF NOT EXISTS schedule_id uuid,
  ADD COLUMN IF NOT EXISTS schedule_exception_id uuid;

COMMENT ON COLUMN public.classroom_attendance_sessions.schedule_id IS
  'Recurring attendance schedule that generated this session; NULL for manual one-off sessions.';
COMMENT ON COLUMN public.classroom_attendance_sessions.schedule_exception_id IS
  'Schedule exception used to generate this session; NULL when the base recurrence rule was used.';

ALTER TABLE public.classroom_attendance_sessions
  ADD CONSTRAINT fk_classroom_attendance_sessions_schedule
    FOREIGN KEY (schedule_id)
    REFERENCES public.classroom_attendance_schedules(id)
    ON DELETE SET NULL;

ALTER TABLE public.classroom_attendance_sessions
  ADD CONSTRAINT fk_classroom_attendance_sessions_schedule_exception
    FOREIGN KEY (schedule_exception_id)
    REFERENCES public.classroom_attendance_schedule_exceptions(id)
    ON DELETE SET NULL;

ALTER TABLE public.classroom_attendance_sessions
  ADD CONSTRAINT uq_classroom_attendance_sessions_schedule_date
    UNIQUE (schedule_id, session_date);

