-- =============================================================================
-- LESSON DRAFT JSONB — 01_tables
-- Make lessons.content the canonical Lexical draft store and extend analytics
-- with block metadata so lesson_blocks can be retired safely.
-- docs/architecture/db_principles.md: JSONB for editor payloads; comments on
-- new/changed application columns.
-- =============================================================================

-- =============================================================================
-- 1. Canonical empty lesson draft state helper
-- =============================================================================

CREATE OR REPLACE FUNCTION app.empty_lesson_lexical_state()
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = public, app
AS $$
  SELECT jsonb_build_object(
    'root', jsonb_build_object(
      'children', jsonb_build_array(
        jsonb_build_object(
          'children', '[]'::jsonb,
          'direction', NULL,
          'format', '',
          'indent', 0,
          'type', 'paragraph',
          'version', 1
        )
      ),
      'direction', NULL,
      'format', '',
      'indent', 0,
      'type', 'root',
      'version', 1
    )
  );
$$;

COMMENT ON FUNCTION app.empty_lesson_lexical_state IS
  'Returns the canonical empty Lexical lesson draft JSONB used for new lessons and backfills.';

-- =============================================================================
-- 2. lessons.content is the draft source of truth
-- =============================================================================

ALTER TABLE public.lessons
  ALTER COLUMN content SET DEFAULT app.empty_lesson_lexical_state();

COMMENT ON COLUMN public.lessons.content IS
  'Canonical editable Lexical draft JSONB for the lesson editor.';

COMMENT ON COLUMN public.lessons.content_schema_version IS
  'Schema version for the canonical lesson draft JSONB.';

-- =============================================================================
-- 3. learning_events: add optional block metadata
-- =============================================================================

ALTER TABLE public.learning_events
  ADD COLUMN IF NOT EXISTS block_type text;

ALTER TABLE public.learning_events
  ADD COLUMN IF NOT EXISTS block_index integer;

COMMENT ON COLUMN public.learning_events.block_type IS
  'Optional Lexical block type snapshot for block-granular analytics after legacy block rows are retired.';

COMMENT ON COLUMN public.learning_events.block_index IS
  'Optional zero-based block position inside the lesson draft JSON.';

CREATE INDEX IF NOT EXISTS idx_learning_events_lesson_block_type
  ON public.learning_events (lesson_id, block_type)
  WHERE block_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_learning_events_lesson_block_index
  ON public.learning_events (lesson_id, block_index, created_at DESC)
  WHERE block_index IS NOT NULL;
