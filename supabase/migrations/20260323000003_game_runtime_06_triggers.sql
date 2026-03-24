-- =============================================================================
-- GAME RUNTIME — trigger functions + CREATE TRIGGER
-- Split from 20260323000003_game_runtime.sql
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS game_runs_updated_at ON public.game_runs;
CREATE TRIGGER game_runs_updated_at
  BEFORE UPDATE ON public.game_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
