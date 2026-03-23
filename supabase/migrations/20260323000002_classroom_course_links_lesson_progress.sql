-- =============================================================================
-- PHASE B — Classroom-course links, lesson progress, learning events
--
-- Doc map:
--   05_Classroom → classroom_course_links (publish courses to classrooms)
--   07_Course §4 → lesson_progress (student progress per lesson)
--   07_Course §5 → teacher analytics via learning_events
--   07_Course §6 → learning_events (granular event log)
--   db_guide_line_en.md → FORCE RLS, institution_id, COMMENT ON, audit timestamps
--
-- Requires: 20260321000002 (classrooms, institution_memberships, app.*)
-- =============================================================================

-- =============================================================================
-- 1. CLASSROOM_COURSE_LINKS — teacher publishes a course to a classroom
-- =============================================================================
CREATE TABLE public.classroom_course_links (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid        NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  course_id       uuid        NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

COMMENT ON TABLE  public.classroom_course_links                IS 'Links a course to a classroom for scoped delivery (doc 05/07).';
COMMENT ON COLUMN public.classroom_course_links.institution_id IS 'Tenant boundary; must match both classroom and course.';
COMMENT ON COLUMN public.classroom_course_links.published_at   IS 'When the link was made visible to students; NULL = draft.';

CREATE UNIQUE INDEX idx_ccl_unique
  ON public.classroom_course_links (classroom_id, course_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_ccl_institution ON public.classroom_course_links (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ccl_course      ON public.classroom_course_links (course_id)      WHERE deleted_at IS NULL;
CREATE INDEX idx_ccl_classroom   ON public.classroom_course_links (classroom_id)   WHERE deleted_at IS NULL;

ALTER TABLE public.classroom_course_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_course_links FORCE ROW LEVEL SECURITY;

CREATE POLICY ccl_super_admin ON public.classroom_course_links
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY ccl_institution_admin ON public.classroom_course_links
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

-- Teachers can manage links for classrooms they own, co-teach, or courses they authored.
CREATE POLICY ccl_teacher_manage ON public.classroom_course_links
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms cr
      WHERE cr.id = classroom_course_links.classroom_id
        AND cr.primary_teacher_id = (select app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = classroom_course_links.classroom_id
        AND cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = classroom_course_links.course_id
        AND c.teacher_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classrooms cr
      WHERE cr.id = classroom_course_links.classroom_id
        AND cr.primary_teacher_id = (select app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = classroom_course_links.classroom_id
        AND cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = classroom_course_links.course_id
        AND c.teacher_id = (select app.auth_uid())
    )
  );

-- Students (and co-teachers) discover links only for classrooms they belong to.
CREATE POLICY ccl_member_read ON public.classroom_course_links
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = classroom_course_links.classroom_id
        AND cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
    )
  );

DROP TRIGGER IF EXISTS ccl_updated_at ON public.classroom_course_links;
CREATE TRIGGER ccl_updated_at
  BEFORE UPDATE ON public.classroom_course_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 1b. Membership-derived role helpers + student access helpers (Variant A)
-- =============================================================================
CREATE OR REPLACE FUNCTION app.caller_is_student_in(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.institution_memberships m
    where m.user_id = (select app.auth_uid())
      and m.membership_role = 'student'::public.membership_role
      and m.status = 'active'::public.membership_status
      and m.deleted_at is null
      and m.left_institution_at is null
      and (
        m.institution_id = p_institution_id
        -- Legacy NULL institution_id rows in courses still need deterministic branching.
        or (p_institution_id is null)
      )
  );
$$;

COMMENT ON FUNCTION app.caller_is_student_in(uuid) IS
  'True if caller is an active student in the given institution; for NULL institution_id, evaluates as active student in any institution.';

CREATE OR REPLACE FUNCTION app.caller_is_active_member_of(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.institution_memberships m
    where m.user_id = (select app.auth_uid())
      and m.status = 'active'::public.membership_status
      and m.deleted_at is null
      and m.left_institution_at is null
      and (
        m.institution_id = p_institution_id
        or (p_institution_id is null)
      )
  );
$$;

COMMENT ON FUNCTION app.caller_is_active_member_of(uuid) IS
  'True if caller has any active membership for the institution; for NULL institution_id, evaluates as active member in any institution.';

CREATE OR REPLACE FUNCTION app.student_can_access_course(p_course_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.classroom_course_links ccl
    inner join public.classroom_members cm
      on cm.classroom_id = ccl.classroom_id
     and cm.user_id = auth.uid()
     and cm.withdrawn_at is null
    where ccl.course_id = p_course_id
      and ccl.deleted_at is null
      and ccl.published_at is not null
      and ccl.institution_id in (select app.member_institution_ids())
  )
$$;

COMMENT ON FUNCTION app.student_can_access_course(uuid) IS
  'True if caller may access this course via published classroom_course_link in an assigned classroom (Variant A; no enrollment required).';

-- =============================================================================
-- 1c. Course catalog for students — only classroom-delivered courses
--     (depends on student_can_access_course; replaces Phase A courses_published_read)
-- =============================================================================
DROP POLICY IF EXISTS courses_published_read ON public.courses;
CREATE POLICY courses_published_read ON public.courses FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR (
    is_published = true
    AND (
      institution_id IS NULL
      OR institution_id IN (select app.member_institution_ids())
    )
    AND (
      NOT (select app.caller_is_student_in(institution_id))
      OR (select app.student_can_access_course(id))
    )
  )
);

CREATE OR REPLACE FUNCTION app.student_can_access_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.lessons l
    inner join public.topics t on t.id = l.topic_id
    where l.id = p_lesson_id
      and app.student_can_access_course(t.course_id)
  )
$$;

COMMENT ON FUNCTION app.student_can_access_lesson(uuid) IS
  'True if caller may access this lesson via classroom-delivered course access (Variant A).';

-- =============================================================================
-- 1d. Frontend contract (future): tenant-aware membership lookup
-- =============================================================================
CREATE OR REPLACE FUNCTION app.get_my_membership(p_institution_id uuid)
RETURNS TABLE (
  membership_role text,
  status text,
  institution_id uuid,
  institution_name text,
  left_at timestamptz
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  select
    m.membership_role::text as membership_role,
    m.status::text as status,
    m.institution_id,
    i.name as institution_name,
    m.left_institution_at as left_at
  from public.institution_memberships m
  inner join public.institutions i on i.id = m.institution_id
  where m.user_id = (select app.auth_uid())
    and m.institution_id = p_institution_id
    and m.deleted_at is null
  order by m.created_at desc
  limit 1;
$$;

COMMENT ON FUNCTION app.get_my_membership(uuid) IS
  'Returns caller membership context for one institution (role/status/name/left_at). For tenant-aware frontend routing after login.';

-- =============================================================================
-- 2. LESSON_PROGRESS — student progress per lesson (doc 07 MVP)
-- =============================================================================
CREATE TABLE public.lesson_progress (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  lesson_id       uuid        NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  last_position   jsonb,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.lesson_progress                 IS 'Per-student lesson progress and completion tracking (doc 07).';
COMMENT ON COLUMN public.lesson_progress.institution_id  IS 'Tenant boundary.';
COMMENT ON COLUMN public.lesson_progress.last_position   IS 'Last slide/page position for resume (e.g. {"page_index": 2}).';
COMMENT ON COLUMN public.lesson_progress.completed_at    IS 'Set when student finishes all slides; NULL = in-progress.';

CREATE UNIQUE INDEX idx_lp_user_lesson
  ON public.lesson_progress (user_id, lesson_id);

CREATE INDEX idx_lp_institution ON public.lesson_progress (institution_id);
CREATE INDEX idx_lp_lesson      ON public.lesson_progress (lesson_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress FORCE ROW LEVEL SECURITY;

CREATE POLICY lp_super_admin ON public.lesson_progress
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Students manage their own progress for lessons they may access (enrollment or classroom delivery).
CREATE POLICY lp_own ON public.lesson_progress
  FOR ALL TO authenticated
  USING  (
    user_id = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
    AND (select app.student_can_access_lesson(lesson_id))
  )
  WITH CHECK (
    user_id = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
    AND (select app.student_can_access_lesson(lesson_id))
  );

-- Teachers can view progress for lessons in their courses.
CREATE POLICY lp_teacher_read ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.topics t ON l.topic_id = t.id
      JOIN public.courses c ON t.course_id = c.id
      WHERE c.teacher_id = (select app.auth_uid())
    )
  );

-- Institution admins can read progress in their institutions.
CREATE POLICY lp_institution_admin_read ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

DROP TRIGGER IF EXISTS lp_updated_at ON public.lesson_progress;
CREATE TRIGGER lp_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. Optional: add content_schema_version to lessons
-- =============================================================================
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS content_schema_version integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.lessons.content_schema_version IS 'Schema version for content/pages JSONB; bump on structural changes.';

-- =============================================================================
-- 4. LEARNING_EVENTS — append-only granular analytics log (doc 07 §5–6)
--
-- High-volume, insert-only table. Students insert their own events;
-- teachers and admins read for analytics. No UPDATE/DELETE by students.
--
-- Indexes are tuned for the analytics queries from doc 07 §5:
--   - per-student lesson completion  → idx_le_user_lesson
--   - class completion by topic      → idx_le_lesson + join topics
--   - drop-off points by lesson      → idx_le_lesson + event_type filter
--   - most-skipped lesson signals    → idx_le_lesson (absence = skipped)
--   - last activity / inactivity     → idx_le_user_latest
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE learning_event_type AS ENUM (
    'lesson_opened',
    'lesson_completed',
    'slide_viewed',
    'slide_time_spent',
    'slide_navigation',
    'note_created_from_slide'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE public.learning_events (
  id              uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid                NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id         uuid                NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  course_id       uuid                NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id       uuid                NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  event_type      learning_event_type NOT NULL,
  slide_index     integer,
  duration_ms     integer,
  direction       text,
  metadata        jsonb,
  created_at      timestamptz         NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.learning_events                IS 'Append-only student learning event log for analytics (doc 07 §6).';
COMMENT ON COLUMN public.learning_events.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.learning_events.course_id      IS 'Denormalized from lesson→topic→course for fast analytics queries.';
COMMENT ON COLUMN public.learning_events.event_type     IS 'What happened: lesson_opened, slide_viewed, etc.';
COMMENT ON COLUMN public.learning_events.slide_index    IS 'Page/slide index within the lesson (0-based).';
COMMENT ON COLUMN public.learning_events.duration_ms    IS 'Time spent in milliseconds (for slide_time_spent events).';
COMMENT ON COLUMN public.learning_events.direction      IS 'Navigation direction: forward, backward, jump (for slide_navigation).';
COMMENT ON COLUMN public.learning_events.metadata       IS 'Extensible payload: e.g. {note_id} for note_created_from_slide.';

-- Analytics indexes (doc 07 §5 queries)
CREATE INDEX idx_le_user_lesson   ON public.learning_events (user_id, lesson_id, event_type);
CREATE INDEX idx_le_lesson        ON public.learning_events (lesson_id, event_type, created_at);
CREATE INDEX idx_le_course        ON public.learning_events (course_id, event_type);
CREATE INDEX idx_le_institution   ON public.learning_events (institution_id);
CREATE INDEX idx_le_user_latest   ON public.learning_events (user_id, created_at DESC);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events FORCE ROW LEVEL SECURITY;

CREATE POLICY le_super_admin ON public.learning_events
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Students insert their own events only for accessible lessons; course_id must match lesson.
CREATE POLICY le_student_insert ON public.learning_events
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
    AND (select app.student_can_access_lesson(lesson_id))
    AND course_id = (
      SELECT c.id
      FROM public.lessons l
      JOIN public.topics t ON t.id = l.topic_id
      JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = learning_events.lesson_id
    )
  );

-- Students read their own events (for personal analytics / resume).
CREATE POLICY le_student_own_read ON public.learning_events
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

-- Teachers read events for lessons in their courses.
CREATE POLICY le_teacher_read ON public.learning_events
  FOR SELECT TO authenticated
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE teacher_id = (select app.auth_uid())
    )
  );

-- Institution admins read all events in their institutions.
CREATE POLICY le_institution_admin_read ON public.learning_events
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- =============================================================================
-- 5. Topics/lessons student SELECT — add classroom delivery (Phase A policies)
-- =============================================================================
DROP POLICY IF EXISTS topics_enrolled_read ON public.topics;
CREATE POLICY topics_enrolled_read ON public.topics
  FOR SELECT TO authenticated
  USING (
    (select app.is_super_admin()) is true
    OR (select app.student_can_access_course(course_id))
  );

DROP POLICY IF EXISTS lessons_enrolled_read ON public.lessons;
CREATE POLICY lessons_enrolled_read ON public.lessons
  FOR SELECT TO authenticated
  USING (
    (select app.is_super_admin()) is true
    OR (select app.student_can_access_lesson(id))
  );
