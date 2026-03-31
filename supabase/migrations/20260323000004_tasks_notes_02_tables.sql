-- =============================================================================
-- TASKS & NOTES — Table definitions
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- task_templates — stable reusable task identity
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

COMMENT ON TABLE public.task_templates IS
  'Stable reusable task definition identity; offerings/history live on task_deliveries.';
COMMENT ON COLUMN public.task_templates.institution_id IS 'Tenant boundary.';

-- -----------------------------------------------------------------------------
-- task_template_versions — immutable published snapshot of a task template
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  task_template_id uuid NOT NULL REFERENCES public.task_templates (id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  status public.task_template_version_status NOT NULL DEFAULT 'draft',
  title text NOT NULL,
  instructions jsonb NOT NULL DEFAULT '{}'::jsonb,
  rubric jsonb,
  grading_settings jsonb,
  attachments jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  archived_at timestamptz,
  CONSTRAINT uq_task_template_versions_template_version_number UNIQUE (task_template_id, version_number)
);

COMMENT ON TABLE public.task_template_versions IS
  'Immutable template snapshot used by task_deliveries.';
COMMENT ON COLUMN public.task_template_versions.instructions IS
  'Primary assignment instructions as JSONB rich text.';

-- -----------------------------------------------------------------------------
-- task_deliveries — offering instance bound to classroom (+ optional course delivery)
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  task_template_id uuid NOT NULL REFERENCES public.task_templates (id) ON DELETE CASCADE,
  task_template_version_id uuid NOT NULL REFERENCES public.task_template_versions (id) ON DELETE RESTRICT,
  classroom_id uuid NOT NULL REFERENCES public.classrooms (id) ON DELETE CASCADE,
  course_delivery_id uuid REFERENCES public.course_deliveries (id) ON DELETE SET NULL,
  teacher_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  status public.task_delivery_status NOT NULL DEFAULT 'draft',
  due_at timestamptz,
  starts_at timestamptz,
  published_at timestamptz,
  closed_at timestamptz,
  legacy_task_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

COMMENT ON TABLE public.task_deliveries IS
  'Classroom offering instance for a task template version.';
COMMENT ON COLUMN public.task_deliveries.course_delivery_id IS
  'Optional course delivery context when task belongs to course flow.';

-- -----------------------------------------------------------------------------
-- tasks — legacy compatibility surface (definition + offering mixed)
-- -----------------------------------------------------------------------------
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL REFERENCES public.classrooms (id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb DEFAULT '{}'::jsonb,
  status task_status NOT NULL DEFAULT 'draft',
  due_at timestamptz,
  published_at timestamptz,
  attachments jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

COMMENT ON TABLE public.tasks IS
  'Legacy compatibility table from pre-template model. New operational flow is task_templates -> task_template_versions -> task_deliveries.';
COMMENT ON COLUMN public.tasks.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.tasks.classroom_id IS 'Classroom this task is assigned to.';
COMMENT ON COLUMN public.tasks.attachments IS 'Array of {type, ref_id}: lesson, note, file references.';
COMMENT ON COLUMN public.tasks.content IS 'Lexical / Yoopta rich-text document stored as JSONB (assignment instructions).';
COMMENT ON COLUMN public.tasks.due_at IS 'Deadline for submission.';

-- -----------------------------------------------------------------------------
-- task_groups — group assignment within a task delivery
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_delivery_id uuid NOT NULL REFERENCES public.task_deliveries (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  name text NOT NULL,
  note_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.task_groups IS 'Student work group within a task delivery (doc 09).';
COMMENT ON COLUMN public.task_groups.institution_id IS 'Tenant boundary; must match parent task_delivery.';
COMMENT ON COLUMN public.task_groups.note_id IS 'Shared collaborative note provisioned for this group.';

-- -----------------------------------------------------------------------------
-- task_group_members — students assigned to groups
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_group_id uuid NOT NULL REFERENCES public.task_groups (id) ON DELETE CASCADE,
  task_delivery_id uuid NOT NULL REFERENCES public.task_deliveries (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.task_group_members IS 'Student membership in a task group (doc 09).';
COMMENT ON COLUMN public.task_group_members.institution_id IS 'Tenant boundary.';

-- -----------------------------------------------------------------------------
-- task_submissions — group submission lifecycle
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_group_id uuid NOT NULL REFERENCES public.task_groups (id) ON DELETE CASCADE,
  task_delivery_id uuid NOT NULL REFERENCES public.task_deliveries (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  status submission_status NOT NULL DEFAULT 'submitted',
  submitted_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  feedback text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.task_submissions IS 'Group submission for a task (doc 09).';
COMMENT ON COLUMN public.task_submissions.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.task_submissions.feedback IS 'Teacher qualitative feedback.';

ALTER TABLE public.task_deliveries
  ADD CONSTRAINT fk_task_deliveries_legacy_tasks
  FOREIGN KEY (legacy_task_id) REFERENCES public.tasks (id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- notes — single-row JSONB document MVP (doc 06)
-- -----------------------------------------------------------------------------
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  task_group_id uuid REFERENCES public.task_groups (id) ON DELETE SET NULL,
  scope note_scope NOT NULL DEFAULT 'personal',
  title text,
  content jsonb DEFAULT '{}'::jsonb,
  content_schema_version integer NOT NULL DEFAULT 1,
  is_pinned boolean NOT NULL DEFAULT FALSE,
  lesson_id uuid REFERENCES public.lessons (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

COMMENT ON TABLE public.notes IS 'Single-row JSONB note document — personal or collaborative (doc 06 MVP).';
COMMENT ON COLUMN public.notes.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.notes.owner_user_id IS 'Creator / owner of the note.';
COMMENT ON COLUMN public.notes.task_group_id IS 'If set, note is the shared workspace for this task group.';
COMMENT ON COLUMN public.notes.scope IS 'personal = single-user; collaborative = realtime multi-user.';
COMMENT ON COLUMN public.notes.content IS 'Lexical / Yoopta rich-text document stored as JSONB; NULL or {} allowed.';
COMMENT ON COLUMN public.notes.content_schema_version IS 'Schema version for the content JSONB structure.';
COMMENT ON COLUMN public.notes.lesson_id IS 'Optional link to a lesson/slide context.';

-- Wire task_groups.note_id FK now that notes table exists.
ALTER TABLE public.task_groups
  ADD CONSTRAINT fk_task_groups_notes
  FOREIGN KEY (note_id) REFERENCES public.notes (id) ON DELETE SET NULL;
