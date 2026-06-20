-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — triggers
-- Requires: 20260000000077_game_analytics_alignment_04_functions_rpcs.sql
-- =============================================================================

DROP TRIGGER IF EXISTS trg_game_deliveries_set_updated_at ON public.game_deliveries;
CREATE TRIGGER trg_game_deliveries_set_updated_at
  BEFORE UPDATE ON public.game_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_game_session_participants_refresh_scoped_stats ON public.game_session_participants;
