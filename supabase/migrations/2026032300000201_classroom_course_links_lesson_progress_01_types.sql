-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — Types & enums
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
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
