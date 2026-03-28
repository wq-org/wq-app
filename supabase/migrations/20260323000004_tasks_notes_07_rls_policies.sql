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

DROP POLICY IF EXISTS tasks_super_admin ON public.tasks;
DROP POLICY IF EXISTS tasks_all_super_admin ON public.tasks;
CREATE POLICY tasks_all_super_admin ON public.tasks
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS tasks_institution_admin ON public.tasks;
DROP POLICY IF EXISTS tasks_all_institution_admin ON public.tasks;
CREATE POLICY tasks_all_institution_admin ON public.tasks
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS tasks_teacher_manage ON public.tasks;
DROP POLICY IF EXISTS tasks_all_teacher ON public.tasks;
CREATE POLICY tasks_all_teacher ON public.tasks
  FOR ALL TO authenticated
  USING (teacher_id = (SELECT app.auth_uid()))
  WITH CHECK (teacher_id = (SELECT app.auth_uid()));

-- Students read published tasks only for classrooms they belong to.
DROP POLICY IF EXISTS tasks_student_read ON public.tasks;
DROP POLICY IF EXISTS tasks_select_student ON public.tasks;
CREATE POLICY tasks_select_student ON public.tasks
  FOR SELECT TO authenticated
  USING (
    status != 'draft'
    AND deleted_at IS NULL
    AND institution_id IN (SELECT app.member_institution_ids())
    AND classroom_id IN (SELECT app.my_active_classroom_ids())
  );

-- =============================================================================
-- task_groups
-- =============================================================================
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_groups FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tg_super_admin ON public.task_groups;
DROP POLICY IF EXISTS task_groups_all_super_admin ON public.task_groups;
CREATE POLICY task_groups_all_super_admin ON public.task_groups
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS tg_institution_admin ON public.task_groups;
DROP POLICY IF EXISTS task_groups_all_institution_admin ON public.task_groups;
CREATE POLICY task_groups_all_institution_admin ON public.task_groups
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

-- Teachers manage groups for their tasks.
DROP POLICY IF EXISTS tg_teacher_manage ON public.task_groups;
DROP POLICY IF EXISTS task_groups_all_teacher ON public.task_groups;
CREATE POLICY task_groups_all_teacher ON public.task_groups
  FOR ALL TO authenticated
  USING (
    task_id IN (SELECT id FROM public.tasks
WHERE teacher_id = (SELECT app.auth_uid()))
  )
  WITH CHECK (
    task_id IN (SELECT id FROM public.tasks
WHERE teacher_id = (SELECT app.auth_uid()))
  );

-- Students read task groups only for tasks in their classrooms.
DROP POLICY IF EXISTS tg_member_read ON public.task_groups;
DROP POLICY IF EXISTS task_groups_select_member ON public.task_groups;
CREATE POLICY task_groups_select_member ON public.task_groups
  FOR SELECT TO authenticated
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      WHERE t.deleted_at IS NULL
        AND t.classroom_id IN (SELECT app.my_active_classroom_ids())
    )
  );

-- =============================================================================
-- task_group_members
-- =============================================================================
ALTER TABLE public.task_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_group_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tgm_super_admin ON public.task_group_members;
DROP POLICY IF EXISTS task_group_members_all_super_admin ON public.task_group_members;
CREATE POLICY task_group_members_all_super_admin ON public.task_group_members
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS tgm_institution_admin ON public.task_group_members;
DROP POLICY IF EXISTS task_group_members_all_institution_admin ON public.task_group_members;
CREATE POLICY task_group_members_all_institution_admin ON public.task_group_members
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

-- Teachers manage group membership for their tasks.
DROP POLICY IF EXISTS tgm_teacher_manage ON public.task_group_members;
DROP POLICY IF EXISTS task_group_members_all_teacher ON public.task_group_members;
CREATE POLICY task_group_members_all_teacher ON public.task_group_members
  FOR ALL TO authenticated
  USING (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      INNER JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      INNER JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (SELECT app.auth_uid())
    )
  );

-- Students can read their own group membership.
DROP POLICY IF EXISTS tgm_own_read ON public.task_group_members;
DROP POLICY IF EXISTS task_group_members_select_own ON public.task_group_members;
CREATE POLICY task_group_members_select_own ON public.task_group_members
  FOR SELECT TO authenticated
  USING (user_id = (SELECT app.auth_uid()));

-- =============================================================================
-- task_submissions
-- =============================================================================
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ts_super_admin ON public.task_submissions;
DROP POLICY IF EXISTS task_submissions_all_super_admin ON public.task_submissions;
CREATE POLICY task_submissions_all_super_admin ON public.task_submissions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS ts_institution_admin ON public.task_submissions;
DROP POLICY IF EXISTS task_submissions_all_institution_admin ON public.task_submissions;
CREATE POLICY task_submissions_all_institution_admin ON public.task_submissions
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

-- Teachers manage submissions for their tasks.
DROP POLICY IF EXISTS ts_teacher_manage ON public.task_submissions;
DROP POLICY IF EXISTS task_submissions_all_teacher ON public.task_submissions;
CREATE POLICY task_submissions_all_teacher ON public.task_submissions
  FOR ALL TO authenticated
  USING (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      INNER JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      INNER JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (SELECT app.auth_uid())
    )
  );

-- Group members can insert submissions and read them.
DROP POLICY IF EXISTS ts_group_member ON public.task_submissions;
DROP POLICY IF EXISTS task_submissions_all_group_member ON public.task_submissions;
CREATE POLICY task_submissions_all_group_member ON public.task_submissions
  FOR ALL TO authenticated
  USING (
    task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    submitted_by = (SELECT app.auth_uid())
    AND task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (SELECT app.auth_uid())
    )
  );

-- =============================================================================
-- notes
-- =============================================================================
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notes_super_admin ON public.notes;
DROP POLICY IF EXISTS notes_all_super_admin ON public.notes;
CREATE POLICY notes_all_super_admin ON public.notes
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS notes_institution_admin_read ON public.notes;
DROP POLICY IF EXISTS notes_select_institution_admin ON public.notes;
CREATE POLICY notes_select_institution_admin ON public.notes
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- Owners manage their own notes.
DROP POLICY IF EXISTS notes_own ON public.notes;
DROP POLICY IF EXISTS notes_all_own ON public.notes;
CREATE POLICY notes_all_own ON public.notes
  FOR ALL TO authenticated
  USING (owner_user_id = (SELECT app.auth_uid()))
  WITH CHECK (owner_user_id = (SELECT app.auth_uid()));

-- Collaborative notes: group members can read and update.
DROP POLICY IF EXISTS notes_collaborative_access ON public.notes;
DROP POLICY IF EXISTS notes_all_collaborative_member ON public.notes;
CREATE POLICY notes_all_collaborative_member ON public.notes
  FOR ALL TO authenticated
  USING (
    scope = 'collaborative'
    AND task_group_id IS NOT NULL
    AND task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    scope = 'collaborative'
    AND task_group_id IS NOT NULL
    AND task_group_id IN (
      SELECT tgm.task_group_id FROM public.task_group_members tgm
      WHERE tgm.user_id = (SELECT app.auth_uid())
    )
  );

-- Teachers can read collaborative notes for tasks they own (monitoring).
DROP POLICY IF EXISTS notes_teacher_read ON public.notes;
DROP POLICY IF EXISTS notes_select_teacher ON public.notes;
CREATE POLICY notes_select_teacher ON public.notes
  FOR SELECT TO authenticated
  USING (
    scope = 'collaborative'
    AND task_group_id IN (
      SELECT tg.id FROM public.task_groups tg
      INNER JOIN public.tasks t ON tg.task_id = t.id
      WHERE t.teacher_id = (SELECT app.auth_uid())
    )
  );
