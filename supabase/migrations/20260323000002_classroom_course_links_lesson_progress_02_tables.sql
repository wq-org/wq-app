-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Tables & columns
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
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

-- =============================================================================
-- 3. Optional: add content_schema_version to lessons
-- =============================================================================
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS content_schema_version integer NOT NULL DEFAULT 1;

COMMENT ON COLUMN public.lessons.content_schema_version IS 'Schema version for content/pages JSONB; bump on structural changes.';

-- =============================================================================
-- 4. LEARNING_EVENTS — append-only granular analytics log (doc 07 §5–6)
-- =============================================================================
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
