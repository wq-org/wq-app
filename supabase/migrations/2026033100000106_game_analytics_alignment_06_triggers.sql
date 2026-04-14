-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — triggers
-- Requires: 20260331000001_game_analytics_alignment_05_backfill_game_runs_and_stats.sql
-- =============================================================================

DROP TRIGGER IF EXISTS trg_game_deliveries_set_updated_at ON public.game_deliveries;
CREATE TRIGGER trg_game_deliveries_set_updated_at
  BEFORE UPDATE ON public.game_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_game_run_stats_scoped_set_updated_at ON public.game_run_stats_scoped;
CREATE TRIGGER trg_game_run_stats_scoped_set_updated_at
  BEFORE UPDATE ON public.game_run_stats_scoped
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_game_session_participants_refresh_scoped_stats ON public.game_session_participants;
CREATE TRIGGER trg_game_session_participants_refresh_scoped_stats
  AFTER INSERT OR UPDATE OF score, completed_at ON public.game_session_participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_game_session_participants_refresh_scoped_stats();
