-- =============================================================================
-- ATTENDANCE + TOPIC GATES — RLS policies
-- Requires: 20260326000004_attendance_topic_gates_06_triggers
-- =============================================================================

-- =============================================================================
-- classroom_attendance_sessions
-- =============================================================================
ALTER TABLE public.classroom_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_attendance_sessions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classroom_attendance_sessions_all_super_admin ON public.classroom_attendance_sessions;
CREATE POLICY classroom_attendance_sessions_all_super_admin ON public.classroom_attendance_sessions
  FOR ALL TO authenticated
  USING  ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS classroom_attendance_sessions_all_institution_admin ON public.classroom_attendance_sessions;
CREATE POLICY classroom_attendance_sessions_all_institution_admin ON public.classroom_attendance_sessions
  FOR ALL TO authenticated
  USING  (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS classroom_attendance_sessions_all_teacher ON public.classroom_attendance_sessions;
CREATE POLICY classroom_attendance_sessions_all_teacher ON public.classroom_attendance_sessions
  FOR ALL TO authenticated
  USING (
    app.caller_can_manage_classroom(classroom_id)
    OR app.caller_can_manage_course(course_id)
  )
  WITH CHECK (
    app.caller_can_manage_classroom(classroom_id)
    OR app.caller_can_manage_course(course_id)
  );

DROP POLICY IF EXISTS classroom_attendance_sessions_select_member ON public.classroom_attendance_sessions;
CREATE POLICY classroom_attendance_sessions_select_member ON public.classroom_attendance_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.classroom_members classroom_member_row
      WHERE classroom_member_row.classroom_id = classroom_attendance_sessions.classroom_id
        AND classroom_member_row.user_id = (SELECT app.auth_uid())
        AND classroom_member_row.withdrawn_at IS NULL
    )
  );

-- =============================================================================
-- classroom_attendance_records
-- =============================================================================
ALTER TABLE public.classroom_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_attendance_records FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classroom_attendance_records_all_super_admin ON public.classroom_attendance_records;
CREATE POLICY classroom_attendance_records_all_super_admin ON public.classroom_attendance_records
  FOR ALL TO authenticated
  USING  ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS classroom_attendance_records_all_institution_admin ON public.classroom_attendance_records;
CREATE POLICY classroom_attendance_records_all_institution_admin ON public.classroom_attendance_records
  FOR ALL TO authenticated
  USING  (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS classroom_attendance_records_all_teacher ON public.classroom_attendance_records;
CREATE POLICY classroom_attendance_records_all_teacher ON public.classroom_attendance_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.classroom_attendance_sessions classroom_attendance_session_row
      WHERE classroom_attendance_session_row.id = classroom_attendance_records.attendance_session_id
        AND (
          app.caller_can_manage_classroom(classroom_attendance_session_row.classroom_id)
          OR app.caller_can_manage_course(classroom_attendance_session_row.course_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.classroom_attendance_sessions classroom_attendance_session_row
      WHERE classroom_attendance_session_row.id = classroom_attendance_records.attendance_session_id
        AND (
          app.caller_can_manage_classroom(classroom_attendance_session_row.classroom_id)
          OR app.caller_can_manage_course(classroom_attendance_session_row.course_id)
        )
    )
  );

DROP POLICY IF EXISTS classroom_attendance_records_select_own ON public.classroom_attendance_records;
CREATE POLICY classroom_attendance_records_select_own ON public.classroom_attendance_records
  FOR SELECT TO authenticated
  USING (student_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS classroom_attendance_records_insert_self_check_in ON public.classroom_attendance_records;
CREATE POLICY classroom_attendance_records_insert_self_check_in ON public.classroom_attendance_records
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (SELECT app.auth_uid())
    AND source = 'self_check_in'::public.attendance_source
  );

DROP POLICY IF EXISTS classroom_attendance_records_update_self_check_in ON public.classroom_attendance_records;
CREATE POLICY classroom_attendance_records_update_self_check_in ON public.classroom_attendance_records
  FOR UPDATE TO authenticated
  USING (
    student_id = (SELECT app.auth_uid())
    AND source = 'self_check_in'::public.attendance_source
  )
  WITH CHECK (
    student_id = (SELECT app.auth_uid())
    AND source = 'self_check_in'::public.attendance_source
  );

-- =============================================================================
-- topic_availability_rules
-- =============================================================================
ALTER TABLE public.topic_availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_availability_rules FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS topic_availability_rules_all_super_admin ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_all_super_admin ON public.topic_availability_rules
  FOR ALL TO authenticated
  USING  ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS topic_availability_rules_all_institution_admin ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_all_institution_admin ON public.topic_availability_rules
  FOR ALL TO authenticated
  USING  (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS topic_availability_rules_all_teacher ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_all_teacher ON public.topic_availability_rules
  FOR ALL TO authenticated
  USING (app.caller_can_manage_course(course_id))
  WITH CHECK (app.caller_can_manage_course(course_id));

DROP POLICY IF EXISTS topic_availability_rules_select_member ON public.topic_availability_rules;
CREATE POLICY topic_availability_rules_select_member ON public.topic_availability_rules
  FOR SELECT TO authenticated
  USING (
    app.caller_can_manage_course(course_id)
    OR (
      institution_id IN (SELECT app.member_institution_ids())
      AND (SELECT app.student_can_access_course(course_id))
    )
  );

-- =============================================================================
-- topics — enforce topic lock rules in student visibility
-- =============================================================================
DROP POLICY IF EXISTS topics_select_member ON public.topics;
CREATE POLICY topics_select_member ON public.topics
  FOR SELECT TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR app.caller_can_manage_course(course_id)
    OR (SELECT app.student_can_access_topic(id))
  );
