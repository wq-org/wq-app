-- =============================================================================
-- Composite covering index for the topic-page lesson list query:
--   SELECT id, title, description, topic_id, created_at, updated_at
--   FROM public.lessons
--   WHERE topic_id = $1
--   ORDER BY created_at ASC;
--
-- Existing idx_lessons_topic is single-column (topic_id) and forces a sort
-- after the index lookup. Adding (topic_id, created_at) lets the planner
-- read in order, removing the sort step on LessonCardList loads.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3. Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_lessons_topic_id_created_at
  ON public.lessons (topic_id, created_at);

COMMENT ON INDEX public.idx_lessons_topic_id_created_at IS
  'Covers topic-scoped lesson lists ordered by created_at (LessonCardList).';
