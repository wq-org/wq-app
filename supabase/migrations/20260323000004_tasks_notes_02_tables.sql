-- =============================================================================
-- TASKS & NOTES — Table definitions
-- Split from 20260323000004_tasks_notes.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- tasks — teacher-created assignments
-- -----------------------------------------------------------------------------
CREATE TABLE public.tasks (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid        NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id      uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title           text        NOT NULL,
  instructions    jsonb,
  status          task_status NOT NULL DEFAULT 'draft',
  due_at          timestamptz,
  published_at    timestamptz,
  attachments     jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

COMMENT ON TABLE  public.tasks                IS 'Teacher-created assignment linked to a classroom (doc 09).';
COMMENT ON COLUMN public.tasks.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.tasks.classroom_id   IS 'Classroom this task is assigned to.';
COMMENT ON COLUMN public.tasks.attachments    IS 'Array of {type, ref_id}: lesson, note, file references.';
COMMENT ON COLUMN public.tasks.due_at         IS 'Deadline for submission.';

-- -----------------------------------------------------------------------------
-- task_groups — group assignment within a task
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_groups (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         uuid        NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  note_id         uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.task_groups                IS 'Student work group within a task (doc 09).';
COMMENT ON COLUMN public.task_groups.institution_id IS 'Tenant boundary; must match parent task.';
COMMENT ON COLUMN public.task_groups.note_id        IS 'Shared collaborative note provisioned for this group.';

-- -----------------------------------------------------------------------------
-- task_group_members — students assigned to groups
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_group_members (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_group_id   uuid        NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.task_group_members                IS 'Student membership in a task group (doc 09).';
COMMENT ON COLUMN public.task_group_members.institution_id IS 'Tenant boundary.';

-- -----------------------------------------------------------------------------
-- task_submissions — group submission lifecycle
-- -----------------------------------------------------------------------------
CREATE TABLE public.task_submissions (
  id              uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  task_group_id   uuid              NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
  institution_id  uuid              NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  status          submission_status NOT NULL DEFAULT 'submitted',
  submitted_by    uuid              NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  submitted_at    timestamptz       NOT NULL DEFAULT now(),
  feedback        text,
  reviewed_at     timestamptz,
  reviewed_by     uuid              REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at      timestamptz       NOT NULL DEFAULT now(),
  updated_at      timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.task_submissions                IS 'Group submission for a task (doc 09).';
COMMENT ON COLUMN public.task_submissions.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.task_submissions.feedback       IS 'Teacher qualitative feedback.';

-- -----------------------------------------------------------------------------
-- notes — single-row JSONB document MVP (doc 06)
-- -----------------------------------------------------------------------------
CREATE TABLE public.notes (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id          uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  owner_user_id           uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  task_group_id           uuid        REFERENCES public.task_groups(id) ON DELETE SET NULL,
  scope                   note_scope  NOT NULL DEFAULT 'personal',
  title                   text,
  content                 jsonb       NOT NULL DEFAULT '{}'::jsonb,
  content_schema_version  integer     NOT NULL DEFAULT 1,
  is_pinned               boolean     NOT NULL DEFAULT false,
  lesson_id               uuid        REFERENCES public.lessons(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  deleted_at              timestamptz
);

COMMENT ON TABLE  public.notes                          IS 'Single-row JSONB note document — personal or collaborative (doc 06 MVP).';
COMMENT ON COLUMN public.notes.institution_id           IS 'Tenant boundary.';
COMMENT ON COLUMN public.notes.owner_user_id            IS 'Creator / owner of the note.';
COMMENT ON COLUMN public.notes.task_group_id            IS 'If set, note is the shared workspace for this task group.';
COMMENT ON COLUMN public.notes.scope                    IS 'personal = single-user; collaborative = realtime multi-user.';
COMMENT ON COLUMN public.notes.content                  IS 'Yoopta block tree stored as JSONB.';
COMMENT ON COLUMN public.notes.content_schema_version   IS 'Schema version for the content JSONB structure.';
COMMENT ON COLUMN public.notes.lesson_id                IS 'Optional link to a lesson/slide context.';

-- Wire task_groups.note_id FK now that notes table exists.
ALTER TABLE public.task_groups
  ADD CONSTRAINT fk_task_groups_notes
  FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE SET NULL;
