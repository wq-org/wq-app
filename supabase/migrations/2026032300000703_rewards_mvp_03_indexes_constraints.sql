-- =============================================================================
-- REWARDS MVP — Indexes & constraints
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

CREATE INDEX idx_point_ledger_user_id_classroom_id ON public.point_ledger (user_id, classroom_id);
CREATE INDEX idx_point_ledger_institution_id ON public.point_ledger (institution_id);
CREATE INDEX idx_point_ledger_classroom_id ON public.point_ledger (classroom_id);
CREATE INDEX idx_point_ledger_task_delivery_id_created_at
  ON public.point_ledger (task_delivery_id, user_id, created_at DESC)
  WHERE task_delivery_id IS NOT NULL;
CREATE INDEX idx_point_ledger_course_delivery_id_created_at
  ON public.point_ledger (course_delivery_id, user_id, created_at DESC)
  WHERE course_delivery_id IS NOT NULL;
CREATE INDEX idx_point_ledger_game_delivery_id_created_at
  ON public.point_ledger (game_delivery_id, user_id, created_at DESC)
  WHERE game_delivery_id IS NOT NULL;

CREATE UNIQUE INDEX idx_classroom_reward_settings_classroom_id
  ON public.classroom_reward_settings (classroom_id);

CREATE INDEX idx_classroom_reward_settings_institution_id ON public.classroom_reward_settings (institution_id);
