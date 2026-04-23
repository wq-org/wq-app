-- =============================================================================
-- LEXICAL CONTENT — Column additions (courses, topics, games)
-- Split layout (8-section) for a new domain migration
-- Requires: 20260209000001_baseline_schema (courses, topics, games)
-- =============================================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS content jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.courses.content IS
  'Lexical / Yoopta rich-text document stored as JSONB; optional alongside description text.';
COMMENT ON COLUMN public.topics.content IS
  'Lexical / Yoopta rich-text document stored as JSONB; optional alongside description text.';
COMMENT ON COLUMN public.games.content IS
  'Lexical / Yoopta rich-text document stored as JSONB; optional alongside description text and game_config.';
