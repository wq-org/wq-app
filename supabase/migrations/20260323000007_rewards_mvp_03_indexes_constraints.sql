-- =============================================================================
-- REWARDS MVP — Indexes & constraints
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

CREATE INDEX idx_pl_user_classroom ON public.point_ledger (user_id, classroom_id);
CREATE INDEX idx_pl_institution    ON public.point_ledger (institution_id);
CREATE INDEX idx_pl_classroom      ON public.point_ledger (classroom_id);

CREATE UNIQUE INDEX idx_crs_classroom
  ON public.classroom_reward_settings (classroom_id);

CREATE INDEX idx_crs_institution ON public.classroom_reward_settings (institution_id);
