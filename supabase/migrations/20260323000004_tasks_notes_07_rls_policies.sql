-- =============================================================================
-- TASKS & NOTES — RLS policies
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- =============================================================================
-- tasks
-- =============================================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;

CREATE POLICY tasks_super_admin ON public.tasks
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY tasks_institution_admin ON public.tasks
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

CREATE POLICY tasks_teacher_manage ON public.tasks
  FOR ALL TO authenticated
  USING  (teacher_id = (select app.auth_uid()))
  WITH CHECK (teacher_id = (select app.auth_uid()));

-- Students read published tasks only for classrooms they belong to.
CREATE POLICY tasks_student_read ON public.tasks
  FOR SELECT TO authenticated
  USING (
    status != 'draft'
    AND deleted_at IS NULL
    AND institution_id IN (select app.member_institution_ids())
    AND classroom_id IN (select app.my_active_classroom_ids())
  );

-- =============================================================================
-- task_groups
-- =============================================================================
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_groups FORCE ROW LEVEL SECURITY;

CREATE POLICY tg_super_admin ON public.task_groups
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY tg_institution_admin ON public.task_groups
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

-- Teachers manage groups for their tasks.
CREATE POLICY tg_teacher_manage ON public.task_groups
  FOR ALL TO authenticated
  USING (
    task_id IN (SELECT id FROM public.tasks WHERE teacher_id = (select app.auth_uid()))
  )
  WITH CHECK (
    task_id IN (SELECT id FROM public.tasks WHERE teacher_id = (select app.auth_uid()))
  );

-- Students read task groups only for tasks in their classrooms.
CREATE POLICY tg_member_read ON public.task_groups
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      WHERE t.deleted_at IS NULL
        AND t.classroom_id IN (select app.my_active_classroom_ids())
    )
  );

-- =============================================================================
-- task_group_members
-- =============================================================================
ALTER TABLE public.task_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_group_members FORCE ROW LEVEL SECURITY;

CREATE POLICY tgm_super_admin ON public.task_group_members
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY tgm_institution_admin ON public.task_group_members
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

-- Teachers manage group membership for their tasks.
CREATE POLICY tgm_teacher_manage ON public.task_group_members
  FOR ALL TO authenticated
  USING (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (select app.auth_uid())
    )
  );

-- Students can read their own group membership.
CREATE POLICY tgm_own_read ON public.task_group_members
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

-- =============================================================================
-- task_submissions
-- =============================================================================
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions FORCE ROW LEVEL SECURITY;

CREATE POLICY ts_super_admin ON public.task_submissions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY ts_institution_admin ON public.task_submissions
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

-- Teachers manage submissions for their tasks.
CREATE POLICY ts_teacher_manage ON public.task_submissions
  FOR ALL TO authenticated
  USING (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (select app.auth_uid())
    )
  );

-- Group members can insert submissions and read them.
CREATE POLICY ts_group_member ON public.task_submissions
  FOR ALL TO authenticated
  USING (
    task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    submitted_by = (select app.auth_uid())
    AND task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (select app.auth_uid())
    )
  );

-- =============================================================================
-- notes
-- =============================================================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes FORCE ROW LEVEL SECURITY;

CREATE POLICY notes_super_admin ON public.notes
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY notes_institution_admin_read ON public.notes
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- Owners manage their own notes.
CREATE POLICY notes_own ON public.notes
  FOR ALL TO authenticated
  USING  (owner_user_id = (select app.auth_uid()))
  WITH CHECK (owner_user_id = (select app.auth_uid()));

-- Collaborative notes: group members can read and update.
CREATE POLICY notes_collaborative_access ON public.notes
  FOR ALL TO authenticated
  USING (
    scope = 'collaborative'
    AND task_group_id IS NOT NULL
    AND task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    scope = 'collaborative'
    AND task_group_id IS NOT NULL
    AND task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (select app.auth_uid())
    )
  );

-- Teachers can read collaborative notes for tasks they own (monitoring).
CREATE POLICY notes_teacher_read ON public.notes
  FOR SELECT TO authenticated
  USING (
    scope = 'collaborative'
    AND task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (select app.auth_uid())
    )
  );
