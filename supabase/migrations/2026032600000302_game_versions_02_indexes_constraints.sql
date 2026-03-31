-- =============================================================================
-- GAME VERSIONS — indexes & constraints
-- Requires: 20260326000003_game_versions_01_tables
-- =============================================================================

-- game_versions hot paths and integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_versions_game_id_version_no
  ON public.game_versions (game_id, version_no);

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_versions_game_id_id
  ON public.game_versions (game_id, id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_game_versions_game_id_draft
  ON public.game_versions (game_id)
  WHERE status = 'draft';

CREATE INDEX IF NOT EXISTS idx_game_versions_institution_id_status_version_no
  ON public.game_versions (institution_id, status, version_no DESC);

CREATE INDEX IF NOT EXISTS idx_game_versions_game_id_status_version_no
  ON public.game_versions (game_id, status, version_no DESC);

-- games container pointers
CREATE INDEX IF NOT EXISTS idx_games_current_published_version_id
  ON public.games (current_published_version_id)
  WHERE current_published_version_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_games_archived_at
  ON public.games (archived_at)
  WHERE archived_at IS NOT NULL;

-- runtime lookup on the pinned version
CREATE INDEX IF NOT EXISTS idx_game_runs_game_version_id
  ON public.game_runs (game_version_id)
  WHERE game_version_id IS NOT NULL;

-- FK from run -> exact version (same game enforced via composite reference)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'game_runs'
      AND constraint_name = 'fk_game_runs_game_version'
  ) THEN
    ALTER TABLE public.game_runs
      ADD CONSTRAINT fk_game_runs_game_version
      FOREIGN KEY (game_id, game_version_id)
      REFERENCES public.game_versions (game_id, id)
      ON DELETE RESTRICT;
  END IF;
END;
$$;
