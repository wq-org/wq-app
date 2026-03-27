-- =============================================================================
-- ATTENDANCE + TOPIC GATES — functions & RPCs
-- Requires: 20260326000004_attendance_topic_gates_03_indexes_constraints
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Permission helpers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.caller_can_manage_classroom(p_classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classrooms classroom_row
    WHERE classroom_row.id = p_classroom_id
      AND classroom_row.primary_teacher_id = (SELECT app.auth_uid())
  )
  OR EXISTS (
    SELECT 1
    FROM public.classroom_members classroom_member_row
    WHERE classroom_member_row.classroom_id = p_classroom_id
      AND classroom_member_row.user_id = (SELECT app.auth_uid())
      AND classroom_member_row.withdrawn_at IS NULL
      AND classroom_member_row.membership_role = 'co_teacher'::public.classroom_member_role
  )
  OR (SELECT app.is_super_admin()) IS TRUE;
$$;

COMMENT ON FUNCTION app.caller_can_manage_classroom(uuid) IS
  'True if caller is primary teacher, co-teacher, or super admin for the classroom.';

CREATE OR REPLACE FUNCTION app.caller_can_manage_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses course_row
    WHERE course_row.id = p_course_id
      AND course_row.teacher_id = (SELECT app.auth_uid())
  )
  OR (SELECT app.is_super_admin()) IS TRUE;
$$;

COMMENT ON FUNCTION app.caller_can_manage_course(uuid) IS
  'True if caller is the course teacher or super admin.';

-- -----------------------------------------------------------------------------
-- Attendance session lifecycle
-- -----------------------------------------------------------------------------
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
    FROM public.classroom_course_links classroom_course_link_row
    WHERE classroom_course_link_row.classroom_id = p_classroom_id
      AND classroom_course_link_row.course_id = p_course_id
      AND classroom_course_link_row.deleted_at IS NULL
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

REVOKE ALL ON FUNCTION public.create_classroom_attendance_session(uuid, uuid, text, date, timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_classroom_attendance_session(uuid, uuid, text, date, timestamptz, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.close_classroom_attendance_session(
  p_attendance_session_id uuid,
  p_ends_at timestamptz DEFAULT now()
)
RETURNS public.classroom_attendance_sessions
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
  WHERE id = p_attendance_session_id;

  IF attendance_session_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance session not found';
  END IF;

  IF NOT app.caller_can_manage_classroom(attendance_session_row.classroom_id) THEN
    RAISE EXCEPTION 'caller cannot close classroom attendance session';
  END IF;

  UPDATE public.classroom_attendance_sessions
  SET ends_at = p_ends_at
  WHERE id = p_attendance_session_id
  RETURNING *
  INTO attendance_session_row;

  RETURN attendance_session_row;
END;
$$;

REVOKE ALL ON FUNCTION public.close_classroom_attendance_session(uuid, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_classroom_attendance_session(uuid, timestamptz) TO authenticated;

-- -----------------------------------------------------------------------------
-- Attendance records
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.teacher_mark_attendance_record(
  p_attendance_session_id uuid,
  p_student_id uuid,
  p_status public.attendance_status,
  p_source public.attendance_source DEFAULT 'manual',
  p_check_in_time timestamptz DEFAULT NULL,
  p_check_out_time timestamptz DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS public.classroom_attendance_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  attendance_session_row public.classroom_attendance_sessions%ROWTYPE;
  attendance_record_row public.classroom_attendance_records%ROWTYPE;
  derived_check_in_time timestamptz;
BEGIN
  SELECT *
  INTO attendance_session_row
  FROM public.classroom_attendance_sessions
  WHERE id = p_attendance_session_id;

  IF attendance_session_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance session not found';
  END IF;

  IF NOT app.caller_can_manage_classroom(attendance_session_row.classroom_id) THEN
    RAISE EXCEPTION 'caller cannot manage attendance records for this classroom';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.classroom_members classroom_member_row
    WHERE classroom_member_row.classroom_id = attendance_session_row.classroom_id
      AND classroom_member_row.user_id = p_student_id
      AND classroom_member_row.withdrawn_at IS NULL
      AND classroom_member_row.membership_role = 'student'::public.classroom_member_role
  ) THEN
    RAISE EXCEPTION 'student is not an active member of the attendance classroom';
  END IF;

  derived_check_in_time := COALESCE(p_check_in_time, now());

  INSERT INTO public.classroom_attendance_records (
    institution_id,
    attendance_session_id,
    student_id,
    status,
    source,
    check_in_time,
    check_out_time,
    note,
    created_by,
    updated_by
  )
  VALUES (
    attendance_session_row.institution_id,
    p_attendance_session_id,
    p_student_id,
    p_status,
    p_source,
    CASE WHEN p_status IN ('present', 'late') THEN derived_check_in_time ELSE p_check_in_time END,
    p_check_out_time,
    p_note,
    (SELECT app.auth_uid()),
    (SELECT app.auth_uid())
  )
  ON CONFLICT (attendance_session_id, student_id)
  DO UPDATE
  SET
    status = EXCLUDED.status,
    source = EXCLUDED.source,
    check_in_time = EXCLUDED.check_in_time,
    check_out_time = EXCLUDED.check_out_time,
    note = EXCLUDED.note,
    updated_by = (SELECT app.auth_uid()),
    updated_at = now()
  RETURNING *
  INTO attendance_record_row;

  RETURN attendance_record_row;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_mark_attendance_record(uuid, uuid, public.attendance_status, public.attendance_source, timestamptz, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_mark_attendance_record(uuid, uuid, public.attendance_status, public.attendance_source, timestamptz, timestamptz, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.student_self_check_in_attendance(
  p_attendance_session_id uuid,
  p_check_in_time timestamptz DEFAULT now()
)
RETURNS public.classroom_attendance_records
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  attendance_session_row public.classroom_attendance_sessions%ROWTYPE;
  attendance_record_row public.classroom_attendance_records%ROWTYPE;
  computed_status public.attendance_status;
  caller_user_id uuid;
BEGIN
  caller_user_id := (SELECT app.auth_uid());

  SELECT *
  INTO attendance_session_row
  FROM public.classroom_attendance_sessions
  WHERE id = p_attendance_session_id;

  IF attendance_session_row.id IS NULL THEN
    RAISE EXCEPTION 'attendance session not found';
  END IF;

  IF attendance_session_row.ends_at IS NOT NULL AND p_check_in_time > attendance_session_row.ends_at THEN
    RAISE EXCEPTION 'attendance session already closed';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.classroom_members classroom_member_row
    WHERE classroom_member_row.classroom_id = attendance_session_row.classroom_id
      AND classroom_member_row.user_id = caller_user_id
      AND classroom_member_row.withdrawn_at IS NULL
      AND classroom_member_row.membership_role = 'student'::public.classroom_member_role
  ) THEN
    RAISE EXCEPTION 'caller is not an active student of the attendance classroom';
  END IF;

  computed_status := CASE
    WHEN p_check_in_time > attendance_session_row.starts_at THEN 'late'::public.attendance_status
    ELSE 'present'::public.attendance_status
  END;

  INSERT INTO public.classroom_attendance_records (
    institution_id,
    attendance_session_id,
    student_id,
    status,
    source,
    check_in_time,
    created_by,
    updated_by
  )
  VALUES (
    attendance_session_row.institution_id,
    p_attendance_session_id,
    caller_user_id,
    computed_status,
    'self_check_in'::public.attendance_source,
    p_check_in_time,
    caller_user_id,
    caller_user_id
  )
  ON CONFLICT (attendance_session_id, student_id)
  DO UPDATE
  SET
    status = EXCLUDED.status,
    source = EXCLUDED.source,
    check_in_time = EXCLUDED.check_in_time,
    updated_by = caller_user_id,
    updated_at = now()
  RETURNING *
  INTO attendance_record_row;

  RETURN attendance_record_row;
END;
$$;

REVOKE ALL ON FUNCTION public.student_self_check_in_attendance(uuid, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_self_check_in_attendance(uuid, timestamptz) TO authenticated;

-- -----------------------------------------------------------------------------
-- Attendance summary read helper for teachers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_attendance_summary(
  p_classroom_id uuid,
  p_course_id uuid,
  p_from_date date,
  p_to_date date
)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  present_count bigint,
  late_count bigint,
  absent_count bigint,
  last_status public.attendance_status,
  last_check_in_time timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF NOT app.caller_can_manage_classroom(p_classroom_id) THEN
    RAISE EXCEPTION 'caller cannot read attendance summary for this classroom';
  END IF;

  RETURN QUERY
  WITH attendance_rows AS (
    SELECT
      classroom_attendance_record_row.student_id,
      classroom_attendance_record_row.status,
      classroom_attendance_record_row.check_in_time,
      classroom_attendance_session_row.starts_at
    FROM public.classroom_attendance_records classroom_attendance_record_row
    JOIN public.classroom_attendance_sessions classroom_attendance_session_row
      ON classroom_attendance_session_row.id = classroom_attendance_record_row.attendance_session_id
    WHERE classroom_attendance_session_row.classroom_id = p_classroom_id
      AND classroom_attendance_session_row.course_id = p_course_id
      AND classroom_attendance_session_row.session_date BETWEEN p_from_date AND p_to_date
  ),
  last_rows AS (
    SELECT DISTINCT ON (attendance_rows.student_id)
      attendance_rows.student_id,
      attendance_rows.status AS last_status,
      attendance_rows.check_in_time AS last_check_in_time
    FROM attendance_rows
    ORDER BY attendance_rows.student_id, attendance_rows.starts_at DESC
  )
  SELECT
    profile_row.user_id AS student_id,
    profile_row.full_name AS student_name,
    COALESCE(SUM(CASE WHEN attendance_rows.status = 'present' THEN 1 ELSE 0 END), 0) AS present_count,
    COALESCE(SUM(CASE WHEN attendance_rows.status = 'late' THEN 1 ELSE 0 END), 0) AS late_count,
    COALESCE(SUM(CASE WHEN attendance_rows.status = 'absent' THEN 1 ELSE 0 END), 0) AS absent_count,
    last_rows.last_status,
    last_rows.last_check_in_time
  FROM public.classroom_members classroom_member_row
  JOIN public.profiles profile_row
    ON profile_row.user_id = classroom_member_row.user_id
  LEFT JOIN attendance_rows
    ON attendance_rows.student_id = classroom_member_row.user_id
  LEFT JOIN last_rows
    ON last_rows.student_id = classroom_member_row.user_id
  WHERE classroom_member_row.classroom_id = p_classroom_id
    AND classroom_member_row.withdrawn_at IS NULL
    AND classroom_member_row.membership_role = 'student'::public.classroom_member_role
  GROUP BY profile_row.user_id, profile_row.full_name, last_rows.last_status, last_rows.last_check_in_time
  ORDER BY profile_row.full_name;
END;
$$;

REVOKE ALL ON FUNCTION public.get_teacher_attendance_summary(uuid, uuid, date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_teacher_attendance_summary(uuid, uuid, date, date) TO authenticated;

-- -----------------------------------------------------------------------------
-- Topic locking helpers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.teacher_lock_topic_for_course(
  p_course_id uuid,
  p_topic_id uuid
)
RETURNS public.topic_availability_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  course_row public.courses%ROWTYPE;
  topic_rule_row public.topic_availability_rules%ROWTYPE;
BEGIN
  IF NOT app.caller_can_manage_course(p_course_id) THEN
    RAISE EXCEPTION 'caller cannot lock topics for this course';
  END IF;

  SELECT *
  INTO course_row
  FROM public.courses
  WHERE id = p_course_id;

  IF course_row.id IS NULL THEN
    RAISE EXCEPTION 'course not found';
  END IF;

  INSERT INTO public.topic_availability_rules (
    institution_id,
    course_id,
    topic_id,
    is_locked,
    unlock_at,
    unlocked_by,
    unlocked_at,
    created_by
  )
  VALUES (
    course_row.institution_id,
    p_course_id,
    p_topic_id,
    true,
    NULL,
    NULL,
    NULL,
    (SELECT app.auth_uid())
  )
  ON CONFLICT (course_id, topic_id)
  DO UPDATE
  SET
    is_locked = true,
    unlock_at = NULL,
    unlocked_by = NULL,
    unlocked_at = NULL,
    updated_at = now()
  RETURNING *
  INTO topic_rule_row;

  RETURN topic_rule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_lock_topic_for_course(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_lock_topic_for_course(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.teacher_unlock_topic_for_course(
  p_course_id uuid,
  p_topic_id uuid
)
RETURNS public.topic_availability_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  topic_rule_row public.topic_availability_rules%ROWTYPE;
BEGIN
  IF NOT app.caller_can_manage_course(p_course_id) THEN
    RAISE EXCEPTION 'caller cannot unlock topics for this course';
  END IF;

  INSERT INTO public.topic_availability_rules (
    institution_id,
    course_id,
    topic_id,
    is_locked,
    unlock_at,
    unlocked_by,
    unlocked_at,
    created_by
  )
  SELECT
    course_row.institution_id,
    p_course_id,
    p_topic_id,
    false,
    NULL,
    (SELECT app.auth_uid()),
    now(),
    (SELECT app.auth_uid())
  FROM public.courses course_row
  WHERE course_row.id = p_course_id
  ON CONFLICT (course_id, topic_id)
  DO UPDATE
  SET
    is_locked = false,
    unlock_at = NULL,
    unlocked_by = (SELECT app.auth_uid()),
    unlocked_at = now(),
    updated_at = now()
  RETURNING *
  INTO topic_rule_row;

  RETURN topic_rule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_unlock_topic_for_course(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_unlock_topic_for_course(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.teacher_schedule_topic_unlock(
  p_course_id uuid,
  p_topic_id uuid,
  p_unlock_at timestamptz
)
RETURNS public.topic_availability_rules
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  topic_rule_row public.topic_availability_rules%ROWTYPE;
BEGIN
  IF NOT app.caller_can_manage_course(p_course_id) THEN
    RAISE EXCEPTION 'caller cannot schedule topic unlock for this course';
  END IF;

  IF p_unlock_at IS NULL THEN
    RAISE EXCEPTION 'unlock timestamp is required';
  END IF;

  INSERT INTO public.topic_availability_rules (
    institution_id,
    course_id,
    topic_id,
    is_locked,
    unlock_at,
    unlocked_by,
    unlocked_at,
    created_by
  )
  SELECT
    course_row.institution_id,
    p_course_id,
    p_topic_id,
    true,
    p_unlock_at,
    NULL,
    NULL,
    (SELECT app.auth_uid())
  FROM public.courses course_row
  WHERE course_row.id = p_course_id
  ON CONFLICT (course_id, topic_id)
  DO UPDATE
  SET
    is_locked = true,
    unlock_at = p_unlock_at,
    unlocked_by = NULL,
    unlocked_at = NULL,
    updated_at = now()
  RETURNING *
  INTO topic_rule_row;

  RETURN topic_rule_row;
END;
$$;

REVOKE ALL ON FUNCTION public.teacher_schedule_topic_unlock(uuid, uuid, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_schedule_topic_unlock(uuid, uuid, timestamptz) TO authenticated;

-- -----------------------------------------------------------------------------
-- Topic access helper + lesson access alignment
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.student_can_access_topic(p_topic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.topics topic_row
    LEFT JOIN public.topic_availability_rules topic_availability_rule_row
      ON topic_availability_rule_row.topic_id = topic_row.id
     AND topic_availability_rule_row.course_id = topic_row.course_id
    WHERE topic_row.id = p_topic_id
      AND app.student_can_access_course(topic_row.course_id)
      AND (
        topic_availability_rule_row.id IS NULL
        OR topic_availability_rule_row.is_locked = false
        OR (
          topic_availability_rule_row.unlock_at IS NOT NULL
          AND topic_availability_rule_row.unlock_at <= now()
        )
      )
  );
$$;

COMMENT ON FUNCTION app.student_can_access_topic(uuid) IS
  'True if caller can access a topic through course access plus topic lock/unlock rules.';

CREATE OR REPLACE FUNCTION app.student_can_access_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lessons lesson_row
    WHERE lesson_row.id = p_lesson_id
      AND app.student_can_access_topic(lesson_row.topic_id)
  );
$$;

COMMENT ON FUNCTION app.student_can_access_lesson(uuid) IS
  'True if caller may access lesson through course delivery and topic availability rules.';
