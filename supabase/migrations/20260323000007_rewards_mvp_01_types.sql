-- =============================================================================
-- REWARDS MVP — Types & enums
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE point_source AS ENUM (
    'game_correct', 'game_speed_bonus', 'game_streak',
    'game_versus_win', 'task_on_time', 'lesson_complete',
    'daily_streak', 'personal_best', 'manual_adjustment'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
