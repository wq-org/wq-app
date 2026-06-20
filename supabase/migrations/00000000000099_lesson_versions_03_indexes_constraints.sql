-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-LESSON-PROGRESS | strip lesson_progress indexes section | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- LESSON VERSIONS — 03_indexes_constraints
-- Indexes for performance, RLS filtering, and resolution lookups
-- =============================================================================

-- =============================================================================
-- lesson_versions indexes
-- =============================================================================

-- Fast resolution: look up lesson version by (institution, lesson, major, patch)
CREATE INDEX IF NOT EXISTS idx_lesson_versions_lesson_lookup
  ON public.lesson_versions (institution_id, lesson_id, version_major, version_patch DESC);

-- Resolve auto-patch: fetch latest active patch within same major
CREATE INDEX IF NOT EXISTS idx_lesson_versions_auto_patch_resolution
  ON public.lesson_versions (institution_id, lesson_id, version_major, is_active DESC, version_patch DESC)
  WHERE is_active IS TRUE AND change_kind IN ('editorial_patch', 'safe_content_patch');

-- Full-text search on lesson content (optional, future enhancement)
CREATE INDEX IF NOT EXISTS idx_lesson_versions_lexical_gin
  ON public.lesson_versions
  USING GIN (lexical_state jsonb_path_ops);

-- Audit: who published what lesson version
CREATE INDEX IF NOT EXISTS idx_lesson_versions_published_by
  ON public.lesson_versions (published_by, published_at DESC);

-- Ensure institution_id is indexed for RLS filtering (per principle_database.md §13)
CREATE INDEX IF NOT EXISTS idx_lesson_versions_institution_id
  ON public.lesson_versions (institution_id);

-- =============================================================================
-- course_version_lessons indexes
-- =============================================================================

-- Fast resolution lookups
CREATE INDEX IF NOT EXISTS idx_course_version_lessons_resolution_lookup
  ON public.course_version_lessons (source_lesson_version_id, resolution_mode, allow_auto_patch);

-- =============================================================================
-- learning_events indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_learning_events_version_id
  ON public.learning_events (lesson_version_id) WHERE lesson_version_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_learning_events_user_version
  ON public.learning_events (user_id, lesson_version_id) WHERE lesson_version_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_learning_events_lesson_version_date
  ON public.learning_events (lesson_version_id, created_at DESC)
  WHERE lesson_version_id IS NOT NULL;
