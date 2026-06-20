-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Types & enums
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================
DO $$
BEGIN
  CREATE TYPE public.learning_event_type AS ENUM (
    'lesson_opened',
    'lesson_closed',
    'lesson_completed',
    'block_viewed',
    'block_interacted',
    'answer_submitted',
    'answer_correct',
    'answer_incorrect',
    'hint_opened',
    'asset_opened',
    'note_created',
    'progress_saved'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
