-- =============================================================================
-- REWARDS MVP — Tables & columns
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

CREATE TABLE public.point_ledger (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid          NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid          NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  user_id         uuid          NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  points          integer       NOT NULL,
  source          point_source  NOT NULL,
  ref_id          uuid,
  ref_type        text,
  description     text,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.point_ledger                IS 'Append-only point log per student per classroom (doc 10).';
COMMENT ON COLUMN public.point_ledger.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.point_ledger.classroom_id   IS 'Points accumulate per classroom per school year.';
COMMENT ON COLUMN public.point_ledger.points         IS 'Positive = earned; negative = spent (joker redemption).';
COMMENT ON COLUMN public.point_ledger.source         IS 'What earned/spent the points.';
COMMENT ON COLUMN public.point_ledger.ref_id         IS 'FK to source entity (game_session_participant, task, lesson, etc).';
COMMENT ON COLUMN public.point_ledger.ref_type       IS 'Entity type for ref_id: game_session, task, lesson, joker, etc.';

CREATE TABLE public.classroom_reward_settings (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid        NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  leaderboard_opt_in boolean NOT NULL DEFAULT false,
  joker_config    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  level_thresholds jsonb      NOT NULL DEFAULT '[{"level":1,"name":"Einsteiger","min_points":0},{"level":2,"name":"Lernprofi","min_points":500},{"level":3,"name":"Wissensträger","min_points":1500},{"level":4,"name":"Experte","min_points":3500},{"level":5,"name":"Meister","min_points":7000}]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.classroom_reward_settings                   IS 'Per-classroom reward settings: joker config, levels, leaderboard (doc 10).';
COMMENT ON COLUMN public.classroom_reward_settings.institution_id    IS 'Tenant boundary.';
COMMENT ON COLUMN public.classroom_reward_settings.leaderboard_opt_in IS 'Whether the classroom leaderboard is visible to students.';
COMMENT ON COLUMN public.classroom_reward_settings.joker_config      IS 'Array of {code, name, cost, monthly_limit, enabled}.';
COMMENT ON COLUMN public.classroom_reward_settings.level_thresholds  IS 'Array of {level, name, min_points} defining rank tiers.';
