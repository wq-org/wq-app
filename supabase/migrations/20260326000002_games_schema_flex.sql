-- =============================================================================
-- GAMES SCHEMA FLEX — game_type text, slug, game_content, session payload
-- Single-file migration (not split) per request.
-- Requires: 20260209000001_baseline_schema (games, enum), 20260323000001_baseline_lms_rls_memberships (games.institution_id)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- games: game_type enum -> text (unbounded types)
-- -----------------------------------------------------------------------------
ALTER TABLE public.games
  ALTER COLUMN game_type TYPE text
  USING game_type::text;

COMMENT ON COLUMN public.games.game_type IS
  'Open-ended game type identifier (text). Formerly enum game_type; now app-defined.';

-- -----------------------------------------------------------------------------
-- games: slug for stable URLs (institution-scoped uniqueness)
-- -----------------------------------------------------------------------------
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS slug text;

COMMENT ON COLUMN public.games.slug IS
  'URL-safe identifier for stable links. Unique per institution when set.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_games_institution_id_slug
  ON public.games (institution_id, slug)
  WHERE slug IS NOT NULL;

-- -----------------------------------------------------------------------------
-- games: rename authored definition JSONB
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'games'
      AND column_name = 'game_config'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'games'
      AND column_name = 'game_content'
  ) THEN
    ALTER TABLE public.games RENAME COLUMN game_config TO game_content;
  END IF;
END;
$$;

COMMENT ON COLUMN public.games.game_content IS
  'Authored game definition stored as JSONB (nodes/edges/rules). Renamed from game_config.';

-- -----------------------------------------------------------------------------
-- runtime: replace participant scores_detail with session_payload
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'game_session_participants'
      AND column_name = 'scores_detail'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'game_session_participants'
      AND column_name = 'session_payload'
  ) THEN
    ALTER TABLE public.game_session_participants
      RENAME COLUMN scores_detail TO session_payload;
  END IF;
END;
$$;

COMMENT ON COLUMN public.game_session_participants.session_payload IS
  'Per-student full session walkthrough stored as JSONB (node states, actions, answers, scoring breakdown, timings).';

-- -----------------------------------------------------------------------------
-- cleanup: drop enum type if no longer referenced
-- -----------------------------------------------------------------------------
DROP TYPE IF EXISTS public.game_type;
