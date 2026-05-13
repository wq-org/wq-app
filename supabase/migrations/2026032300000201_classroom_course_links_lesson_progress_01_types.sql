-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Types & enums
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DO $$ BEGIN
CREATE TYPE learning_event_type AS ENUM (
  'lesson_opened',
  'page_viewed',
  'page_time_spent',
  'page_navigation',
  'lesson_completed',
  'note_created_from_page',
  'interaction_recorded',
  'answer_submitted',
  'answer_correct',
  'answer_incorrect',
  'help_opened',
  'asset_opened'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
