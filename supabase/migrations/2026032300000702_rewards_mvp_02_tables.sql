-- =============================================================================
-- REWARDS MVP — Tables & columns
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

CREATE TABLE public.point_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL REFERENCES public.classrooms (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  points integer NOT NULL,
  source text NOT NULL
    CHECK (
      source IN (
        'game_correct',
        'game_speed_bonus',
        'game_streak',
        'game_versus_win',
        'task_on_time',
        'lesson_complete',
        'daily_streak',
        'personal_best',
        'manual_adjustment'
      )
    ),
  task_delivery_id uuid REFERENCES public.task_deliveries (id) ON DELETE SET NULL,
  -- FK added in 20260329000003_course_delivery_03_indexes_constraints.sql after
  -- course_deliveries exists in reset order.
  course_delivery_id uuid,
  game_delivery_id uuid,
  ref_id uuid,
  ref_type text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_point_ledger_reference_shape CHECK (
    (
      (task_delivery_id IS NOT NULL)::integer
      + (course_delivery_id IS NOT NULL)::integer
      + (game_delivery_id IS NOT NULL)::integer
    ) <= 1
  )
);

COMMENT ON TABLE public.point_ledger IS 'Append-only point log per student per classroom (doc 10).';
COMMENT ON COLUMN public.point_ledger.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.point_ledger.classroom_id IS 'Points accumulate per classroom per school year.';
COMMENT ON COLUMN public.point_ledger.points IS 'Positive = earned; negative = spent (joker redemption).';
COMMENT ON COLUMN public.point_ledger.source IS 'Why points changed; allowed literals enforced by CHECK (see migration).';
COMMENT ON COLUMN public.point_ledger.ref_id IS 'FK to source entity (game_session_participant, task, lesson, etc).';
COMMENT ON COLUMN public.point_ledger.ref_type IS 'Entity type for ref_id: game_session, task, lesson, joker, etc.';
COMMENT ON COLUMN public.point_ledger.task_delivery_id IS 'Typed task offering reference for reward attribution.';
COMMENT ON COLUMN public.point_ledger.course_delivery_id IS 'Typed course offering reference for reward attribution.';
COMMENT ON COLUMN public.point_ledger.game_delivery_id IS 'Reserved typed game delivery reference for future game offering model.';

CREATE TABLE public.classroom_reward_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  classroom_id uuid NOT NULL REFERENCES public.classrooms (id) ON DELETE CASCADE,
  leaderboard_opt_in boolean NOT NULL DEFAULT FALSE,
  joker_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  level_thresholds jsonb NOT NULL DEFAULT '[{"level":1,"name":"Einsteiger","min_points":0},{"level":2,"name":"Lernprofi","min_points":500},{"level":3,"name":"Wissensträger","min_points":1500},{"level":4,"name":"Experte","min_points":3500},{"level":5,"name":"Meister","min_points":7000}]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.classroom_reward_settings IS 'Per-classroom reward settings: joker config, levels, leaderboard (doc 10).';
COMMENT ON COLUMN public.classroom_reward_settings.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.classroom_reward_settings.leaderboard_opt_in IS 'Whether the classroom leaderboard is visible to students.';
COMMENT ON COLUMN public.classroom_reward_settings.joker_config IS 'Array of {code, name, cost, monthly_limit, enabled}.';
COMMENT ON COLUMN public.classroom_reward_settings.level_thresholds IS 'Array of {level, name, min_points} defining rank tiers.';
