-- =============================================================================
-- ANNOUNCEMENTS — RLS policies
-- Split layout (8-section) for a new domain migration
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

-- =============================================================================
-- classroom_announcements
-- =============================================================================
ALTER TABLE public.classroom_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_announcements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ca_super_admin ON public.classroom_announcements;
DROP POLICY IF EXISTS classroom_announcements_all_super_admin ON public.classroom_announcements;
CREATE POLICY classroom_announcements_all_super_admin ON public.classroom_announcements
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS ca_institution_admin_read ON public.classroom_announcements;
DROP POLICY IF EXISTS classroom_announcements_select_institution_admin ON public.classroom_announcements;
CREATE POLICY classroom_announcements_select_institution_admin ON public.classroom_announcements
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- Teachers/co-teachers can manage announcements for their classrooms.
DROP POLICY IF EXISTS ca_teacher_manage ON public.classroom_announcements;
DROP POLICY IF EXISTS classroom_announcements_all_teacher ON public.classroom_announcements;
CREATE POLICY classroom_announcements_all_teacher ON public.classroom_announcements
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  )
  WITH CHECK (
    created_by = (SELECT app.auth_uid())
    AND (
      classroom_id IN (
        SELECT cr.id FROM public.classrooms cr
        WHERE cr.primary_teacher_id = (SELECT app.auth_uid())
      )
      OR classroom_id IN (
        SELECT cm.classroom_id FROM public.classroom_members cm
        WHERE cm.user_id = (SELECT app.auth_uid())
          AND cm.withdrawn_at IS NULL
          AND cm.membership_role = 'co_teacher'::public.classroom_member_role
      )
    )
  );

-- Members read published items only for classrooms they belong to.
DROP POLICY IF EXISTS ca_member_read ON public.classroom_announcements;
DROP POLICY IF EXISTS classroom_announcements_select_member ON public.classroom_announcements;
CREATE POLICY classroom_announcements_select_member ON public.classroom_announcements
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND published_at IS NOT NULL
    AND classroom_id IN (SELECT app.my_active_classroom_ids())
    AND institution_id IN (SELECT app.member_institution_ids())
  );

-- =============================================================================
-- course_announcements
-- =============================================================================
ALTER TABLE public.course_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_announcements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS coa_super_admin ON public.course_announcements;
DROP POLICY IF EXISTS course_announcements_all_super_admin ON public.course_announcements;
CREATE POLICY course_announcements_all_super_admin ON public.course_announcements
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS coa_institution_admin_read ON public.course_announcements;
DROP POLICY IF EXISTS course_announcements_select_institution_admin ON public.course_announcements;
CREATE POLICY course_announcements_select_institution_admin ON public.course_announcements
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- Course teacher can manage announcements for their courses.
DROP POLICY IF EXISTS coa_teacher_manage ON public.course_announcements;
DROP POLICY IF EXISTS course_announcements_all_teacher ON public.course_announcements;
CREATE POLICY course_announcements_all_teacher ON public.course_announcements
  FOR ALL TO authenticated
  USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      WHERE c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    created_by = (SELECT app.auth_uid())
    AND course_id IN (
      SELECT c.id FROM public.courses c
      WHERE c.teacher_id = (SELECT app.auth_uid())
    )
  );

-- Members read published items only for accessible courses (classroom-delivery aware).
DROP POLICY IF EXISTS coa_member_read ON public.course_announcements;
DROP POLICY IF EXISTS course_announcements_select_member ON public.course_announcements;
CREATE POLICY course_announcements_select_member ON public.course_announcements
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND published_at IS NOT NULL
    AND institution_id IN (SELECT app.member_institution_ids())
    AND (
      NOT (SELECT app.caller_is_student_in(institution_id))
      OR (SELECT app.student_can_access_course(course_id))
    )
  );
