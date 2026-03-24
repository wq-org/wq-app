-- =============================================================================
-- TASKS & NOTES — Indexes & constraints
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- tasks
CREATE INDEX idx_tasks_institution ON public.tasks (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_classroom   ON public.tasks (classroom_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_teacher     ON public.tasks (teacher_id)     WHERE deleted_at IS NULL;

-- task_groups
CREATE INDEX idx_task_groups_task        ON public.task_groups (task_id);
CREATE INDEX idx_task_groups_institution ON public.task_groups (institution_id);

-- task_group_members
CREATE UNIQUE INDEX idx_tgm_group_user
  ON public.task_group_members (task_group_id, user_id);

CREATE INDEX idx_tgm_user        ON public.task_group_members (user_id);
CREATE INDEX idx_tgm_institution ON public.task_group_members (institution_id);

-- task_submissions
CREATE INDEX idx_ts_task_group   ON public.task_submissions (task_group_id);
CREATE INDEX idx_ts_institution  ON public.task_submissions (institution_id);

-- notes
CREATE INDEX idx_notes_institution ON public.notes (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_owner       ON public.notes (owner_user_id)  WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_task_group  ON public.notes (task_group_id)  WHERE task_group_id IS NOT NULL AND deleted_at IS NULL;
