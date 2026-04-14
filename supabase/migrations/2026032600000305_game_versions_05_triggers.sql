-- =============================================================================
-- GAME VERSIONS — triggers
-- Requires: 20260326000003_game_versions_04_functions_rpcs
-- =============================================================================

-- game_versions lifecycle + timestamps
DROP TRIGGER IF EXISTS game_versions_updated_at ON public.game_versions;
DROP TRIGGER IF EXISTS trg_game_versions_set_updated_at ON public.game_versions;
CREATE TRIGGER trg_game_versions_set_updated_at
  BEFORE UPDATE ON public.game_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS game_versions_guard ON public.game_versions;
DROP TRIGGER IF EXISTS trg_game_versions_guard_row ON public.game_versions;
CREATE TRIGGER trg_game_versions_guard_row
  BEFORE INSERT OR UPDATE ON public.game_versions
  FOR EACH ROW EXECUTE FUNCTION public.guard_game_versions_lifecycle();

-- games -> versions sync
DROP TRIGGER IF EXISTS trg_games_sync_game_versions ON public.games;
CREATE TRIGGER trg_games_sync_game_versions
  BEFORE INSERT OR UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.sync_games_game_versions();

DROP TRIGGER IF EXISTS games_guard_published_pointer ON public.games;
DROP TRIGGER IF EXISTS trg_games_guard_published_pointer ON public.games;
CREATE TRIGGER trg_games_guard_published_pointer
  BEFORE INSERT OR UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.guard_games_published_pointer();

-- game_runs -> exact version pinning
DROP TRIGGER IF EXISTS game_runs_bind_version ON public.game_runs;
DROP TRIGGER IF EXISTS trg_game_runs_bind_version ON public.game_runs;
CREATE TRIGGER trg_game_runs_bind_version
  BEFORE INSERT OR UPDATE ON public.game_runs
  FOR EACH ROW EXECUTE FUNCTION public.bind_game_run_version();
