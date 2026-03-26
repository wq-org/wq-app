-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Indexes & constraints
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- classroom_course_links
CREATE UNIQUE INDEX idx_classroom_course_links_classroom_id_course_id
  ON public.classroom_course_links (classroom_id, course_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_classroom_course_links_institution_id ON public.classroom_course_links (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_classroom_course_links_course_id      ON public.classroom_course_links (course_id)      WHERE deleted_at IS NULL;
CREATE INDEX idx_classroom_course_links_classroom_id   ON public.classroom_course_links (classroom_id)   WHERE deleted_at IS NULL;

-- lesson_progress
CREATE UNIQUE INDEX idx_lesson_progress_user_id_lesson_id
  ON public.lesson_progress (user_id, lesson_id);

CREATE INDEX idx_lesson_progress_institution_id ON public.lesson_progress (institution_id);
CREATE INDEX idx_lesson_progress_lesson_id      ON public.lesson_progress (lesson_id);

-- learning_events — Analytics indexes (doc 07 §5 queries)
CREATE INDEX idx_learning_events_user_id_lesson_id_event_type   ON public.learning_events (user_id, lesson_id, event_type);
CREATE INDEX idx_learning_events_lesson_id_event_type_created_at        ON public.learning_events (lesson_id, event_type, created_at);
CREATE INDEX idx_learning_events_course_id_event_type        ON public.learning_events (course_id, event_type);
CREATE INDEX idx_learning_events_institution_id   ON public.learning_events (institution_id);
CREATE INDEX idx_learning_events_user_id_created_at   ON public.learning_events (user_id, created_at DESC);
