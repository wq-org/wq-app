-- =============================================================================
-- TASKS & NOTES — Backfills & seed data
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- Backfill stable template/version/delivery rows from legacy tasks.
INSERT INTO public.task_templates (
  id, institution_id, teacher_id, title, description, created_at, updated_at, deleted_at
)
SELECT
  t.id,
  t.institution_id,
  t.teacher_id,
  t.title,
  NULL::text,
  t.created_at,
  t.updated_at,
  t.deleted_at
FROM public.tasks t
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.task_template_versions (
  institution_id,
  task_template_id,
  version_number,
  status,
  title,
  instructions,
  rubric,
  grading_settings,
  attachments,
  created_at,
  published_at,
  archived_at
)
SELECT
  t.institution_id,
  t.id,
  1,
  CASE
    WHEN t.status = 'draft'::public.task_status THEN 'draft'::public.task_template_version_status
    WHEN t.deleted_at IS NOT NULL THEN 'archived'::public.task_template_version_status
    ELSE 'published'::public.task_template_version_status
  END,
  t.title,
  COALESCE(t.content, '{}'::jsonb),
  NULL::jsonb,
  NULL::jsonb,
  t.attachments,
  t.created_at,
  t.published_at,
  CASE WHEN t.deleted_at IS NOT NULL THEN t.updated_at END
FROM public.tasks t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.task_template_versions ttv
  WHERE ttv.task_template_id = t.id
    AND ttv.version_number = 1
);

INSERT INTO public.task_deliveries (
  institution_id,
  task_template_id,
  task_template_version_id,
  classroom_id,
  teacher_id,
  status,
  due_at,
  starts_at,
  published_at,
  closed_at,
  legacy_task_id,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  t.institution_id,
  t.id,
  ttv.id,
  t.classroom_id,
  t.teacher_id,
  CASE
    WHEN t.status = 'draft'::public.task_status THEN 'draft'::public.task_delivery_status
    WHEN t.status IN (
      'published'::public.task_status,
      'not_started'::public.task_status,
      'in_progress'::public.task_status,
      'submitted'::public.task_status,
      'overdue'::public.task_status,
      'reviewed'::public.task_status,
      'returned'::public.task_status
    ) THEN 'active'::public.task_delivery_status
    ELSE 'draft'::public.task_delivery_status
  END,
  t.due_at,
  NULL::timestamptz,
  t.published_at,
  CASE
    WHEN t.status IN ('reviewed'::public.task_status, 'returned'::public.task_status)
      THEN COALESCE(t.updated_at, t.created_at)
  END,
  t.id,
  t.created_at,
  t.updated_at,
  t.deleted_at
FROM public.tasks t
INNER JOIN public.task_template_versions ttv
  ON t.id = ttv.task_template_id
  AND ttv.version_number = 1
WHERE NOT EXISTS (
  SELECT 1
  FROM public.task_deliveries td
  WHERE td.legacy_task_id = t.id
);
