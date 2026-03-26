-- =============================================================================
-- REWARDS MVP — Triggers
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DROP TRIGGER IF EXISTS crs_updated_at ON public.classroom_reward_settings;
DROP TRIGGER IF EXISTS trg_classroom_reward_settings_set_updated_at ON public.classroom_reward_settings;
CREATE TRIGGER trg_classroom_reward_settings_set_updated_at
  BEFORE UPDATE ON public.classroom_reward_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
