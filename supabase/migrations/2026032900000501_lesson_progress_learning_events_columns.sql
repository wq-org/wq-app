-- =============================================================================
-- COURSE DELIVERY — lesson_progress + learning_events: add course_delivery_id
-- Schema-only step (nullable column add + drop old uniqueness index).
-- Data backfill runs in 20260329000005b, lock-down in 20260329000005c.
-- Requires: 20260329000004_course_delivery_04_backfill_versions_deliveries.sql
-- =============================================================================

ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS course_delivery_id uuid;

COMMENT ON COLUMN public.lesson_progress.course_delivery_id IS
  'Course delivery scope. NOT NULL after backfill (20260329000005c).';

ALTER TABLE public.learning_events
  ADD COLUMN IF NOT EXISTS course_delivery_id uuid;

COMMENT ON COLUMN public.learning_events.course_delivery_id IS
  'Course delivery scope. NOT NULL after backfill (20260329000005c).';

-- The (user_id, lesson_id) uniqueness must go before backfill expands rows
-- into (user_id, lesson_id, course_delivery_id) tuples.
DROP INDEX IF EXISTS public.idx_lesson_progress_user_id_lesson_id;
