-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Indexes & constraints
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- classroom_course_links
CREATE UNIQUE INDEX idx_ccl_unique
  ON public.classroom_course_links (classroom_id, course_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_ccl_institution ON public.classroom_course_links (institution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ccl_course      ON public.classroom_course_links (course_id)      WHERE deleted_at IS NULL;
CREATE INDEX idx_ccl_classroom   ON public.classroom_course_links (classroom_id)   WHERE deleted_at IS NULL;

-- lesson_progress
CREATE UNIQUE INDEX idx_lp_user_lesson
  ON public.lesson_progress (user_id, lesson_id);

CREATE INDEX idx_lp_institution ON public.lesson_progress (institution_id);
CREATE INDEX idx_lp_lesson      ON public.lesson_progress (lesson_id);

-- learning_events — Analytics indexes (doc 07 §5 queries)
CREATE INDEX idx_le_user_lesson   ON public.learning_events (user_id, lesson_id, event_type);
CREATE INDEX idx_le_lesson        ON public.learning_events (lesson_id, event_type, created_at);
CREATE INDEX idx_le_course        ON public.learning_events (course_id, event_type);
CREATE INDEX idx_le_institution   ON public.learning_events (institution_id);
CREATE INDEX idx_le_user_latest   ON public.learning_events (user_id, created_at DESC);
