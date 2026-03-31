-- =============================================================================
-- TASKS & NOTES — Indexes & constraints
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- tasks
CREATE INDEX idx_tasks_institution_id ON public.tasks (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_classroom_id ON public.tasks (classroom_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_teacher_id ON public.tasks (teacher_id) WHERE deleted_at IS NULL;

-- task_templates / task_template_versions / task_deliveries
CREATE INDEX idx_task_templates_institution_id ON public.task_templates (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_templates_teacher_id ON public.task_templates (teacher_id) WHERE deleted_at IS NULL;

CREATE INDEX idx_task_template_versions_template_id
  ON public.task_template_versions (task_template_id);
CREATE INDEX idx_task_template_versions_institution_id
  ON public.task_template_versions (institution_id);

CREATE INDEX idx_task_deliveries_institution_id ON public.task_deliveries (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_deliveries_classroom_id ON public.task_deliveries (classroom_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_deliveries_course_delivery_id
  ON public.task_deliveries (course_delivery_id)
  WHERE course_delivery_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_task_deliveries_teacher_id ON public.task_deliveries (teacher_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_deliveries_template_id ON public.task_deliveries (task_template_id) WHERE deleted_at IS NULL;

-- task_groups
CREATE INDEX idx_task_groups_task_delivery_id ON public.task_groups (task_delivery_id);
CREATE INDEX idx_task_groups_institution_id ON public.task_groups (institution_id);

-- task_group_members
CREATE UNIQUE INDEX idx_task_group_members_task_group_id_user_id
  ON public.task_group_members (task_group_id, user_id);
CREATE INDEX idx_task_group_members_task_delivery_id ON public.task_group_members (task_delivery_id);

CREATE INDEX idx_task_group_members_user_id ON public.task_group_members (user_id);
CREATE INDEX idx_task_group_members_institution_id ON public.task_group_members (institution_id);

-- task_submissions
CREATE INDEX idx_task_submissions_task_group_id ON public.task_submissions (task_group_id);
CREATE INDEX idx_task_submissions_task_delivery_id ON public.task_submissions (task_delivery_id);
CREATE INDEX idx_task_submissions_institution_id ON public.task_submissions (institution_id);

-- notes
CREATE INDEX idx_notes_institution_id ON public.notes (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_owner_user_id ON public.notes (owner_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_task_group_id ON public.notes (task_group_id) WHERE task_group_id IS NOT NULL AND deleted_at IS NULL;
