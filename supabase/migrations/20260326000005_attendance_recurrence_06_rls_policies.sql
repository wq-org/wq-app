-- =============================================================================
-- ATTENDANCE RECURRING SCHEDULES — RLS policies
-- Requires: 20260326000005_attendance_recurrence_05_triggers
-- =============================================================================

-- =============================================================================
-- classroom_attendance_schedules
-- =============================================================================
ALTER TABLE public.classroom_attendance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_attendance_schedules FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classroom_attendance_schedules_all_super_admin ON public.classroom_attendance_schedules;
CREATE POLICY classroom_attendance_schedules_all_super_admin ON public.classroom_attendance_schedules
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS classroom_attendance_schedules_all_institution_admin ON public.classroom_attendance_schedules;
CREATE POLICY classroom_attendance_schedules_all_institution_admin ON public.classroom_attendance_schedules
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS classroom_attendance_schedules_all_teacher ON public.classroom_attendance_schedules;
CREATE POLICY classroom_attendance_schedules_all_teacher ON public.classroom_attendance_schedules
  FOR ALL TO authenticated
  USING (
    app.caller_can_manage_attendance_schedule(classroom_id, course_id)
  )
  WITH CHECK (
    app.caller_can_manage_attendance_schedule(classroom_id, course_id)
  );

-- =============================================================================
-- classroom_attendance_schedule_exceptions
-- =============================================================================
ALTER TABLE public.classroom_attendance_schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_attendance_schedule_exceptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classroom_attendance_schedule_exceptions_all_super_admin ON public.classroom_attendance_schedule_exceptions;
CREATE POLICY classroom_attendance_schedule_exceptions_all_super_admin ON public.classroom_attendance_schedule_exceptions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS classroom_attendance_schedule_exceptions_all_institution_admin ON public.classroom_attendance_schedule_exceptions;
CREATE POLICY classroom_attendance_schedule_exceptions_all_institution_admin ON public.classroom_attendance_schedule_exceptions
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS classroom_attendance_schedule_exceptions_all_teacher ON public.classroom_attendance_schedule_exceptions;
CREATE POLICY classroom_attendance_schedule_exceptions_all_teacher ON public.classroom_attendance_schedule_exceptions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.classroom_attendance_schedules schedule_row
      WHERE schedule_row.id = classroom_attendance_schedule_exceptions.schedule_id
        AND app.caller_can_manage_attendance_schedule(schedule_row.classroom_id, schedule_row.course_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.classroom_attendance_schedules schedule_row
      WHERE schedule_row.id = classroom_attendance_schedule_exceptions.schedule_id
        AND app.caller_can_manage_attendance_schedule(schedule_row.classroom_id, schedule_row.course_id)
    )
  );
