-- =============================================================================
-- PHASE D — Tasks + Notes MVP
--
-- Doc map:
--   09_Task → tasks, task_groups, task_group_members, task_submissions
--   06_Note → notes (JSONB single-row MVP)
--   db_guide_line_en.md → FORCE RLS, institution_id, COMMENT ON, audit timestamps
--
-- Requires: 20260321000002 (classrooms, institution_memberships, app.*)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'draft', 'published', 'not_started', 'in_progress',
    'submitted', 'overdue', 'reviewed', 'returned'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE note_scope AS ENUM ('personal', 'collaborative');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 2. TASKS — teacher-created assignments
-- =============================================================================
CREATE TABLE public.tasks (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid        NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id      uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title           text        NOT NULL,
  objective       text,
  instructions    text,
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

CREATE INDEX idx_tasks_institution ON public.tasks (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_classroom   ON public.tasks (classroom_id)   WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_teacher     ON public.tasks (teacher_id)     WHERE deleted_at IS NULL;

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

DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Audit task state transitions.
CREATE OR REPLACE FUNCTION audit.log_task_state_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit.events (actor_id, action, entity_type, entity_id, institution_id, payload)
    VALUES (
      auth.uid(),
      'task_state_change',
      'task',
      NEW.id,
      NEW.institution_id,
      jsonb_build_object(
        'old_status', OLD.status::text,
        'new_status', NEW.status::text
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tasks_audit_state ON public.tasks;
CREATE TRIGGER tasks_audit_state
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION audit.log_task_state_change();

-- =============================================================================
-- 3. TASK_GROUPS — group assignment within a task
-- =============================================================================
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

CREATE INDEX idx_task_groups_task        ON public.task_groups (task_id);
CREATE INDEX idx_task_groups_institution ON public.task_groups (institution_id);

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

DROP TRIGGER IF EXISTS task_groups_updated_at ON public.task_groups;
CREATE TRIGGER task_groups_updated_at
  BEFORE UPDATE ON public.task_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 4. TASK_GROUP_MEMBERS — students assigned to groups
-- =============================================================================
CREATE TABLE public.task_group_members (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_group_id   uuid        NOT NULL REFERENCES public.task_groups(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.task_group_members                IS 'Student membership in a task group (doc 09).';
COMMENT ON COLUMN public.task_group_members.institution_id IS 'Tenant boundary.';

CREATE UNIQUE INDEX idx_tgm_group_user
  ON public.task_group_members (task_group_id, user_id);

CREATE INDEX idx_tgm_user        ON public.task_group_members (user_id);
CREATE INDEX idx_tgm_institution ON public.task_group_members (institution_id);

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
-- 5. TASK_SUBMISSIONS — group submission lifecycle
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM ('submitted', 'reviewed', 'returned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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

CREATE INDEX idx_ts_task_group   ON public.task_submissions (task_group_id);
CREATE INDEX idx_ts_institution  ON public.task_submissions (institution_id);

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

DROP TRIGGER IF EXISTS ts_updated_at ON public.task_submissions;
CREATE TRIGGER ts_updated_at
  BEFORE UPDATE ON public.task_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 6. NOTES — single-row JSONB document MVP (doc 06)
-- =============================================================================
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

CREATE INDEX idx_notes_institution ON public.notes (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_owner       ON public.notes (owner_user_id)  WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_task_group  ON public.notes (task_group_id)  WHERE task_group_id IS NOT NULL AND deleted_at IS NULL;

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

-- Wire task_groups.note_id FK now that notes table exists.
ALTER TABLE public.task_groups
  ADD CONSTRAINT task_groups_note_fk
  FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS notes_updated_at ON public.notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
