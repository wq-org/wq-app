-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — tables
-- Requires: 20260331000001_game_analytics_alignment_01_types.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.game_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  game_id uuid NOT NULL,
  game_version_id uuid NOT NULL,
  classroom_id uuid,
  course_delivery_id uuid,
  lesson_id uuid,
  status public.game_delivery_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_deliveries IS
  'Operational rollout for one immutable game version. May target classroom, course delivery, lesson, or a combination.';
COMMENT ON COLUMN public.game_deliveries.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.game_deliveries.game_id IS 'Stable game identity.';
COMMENT ON COLUMN public.game_deliveries.game_version_id IS 'Immutable version assigned for this rollout.';
COMMENT ON COLUMN public.game_deliveries.classroom_id IS 'Optional classroom scope for assigned play.';
COMMENT ON COLUMN public.game_deliveries.course_delivery_id IS 'Optional parent course delivery scope.';
COMMENT ON COLUMN public.game_deliveries.lesson_id IS 'Optional lesson context that launched the game.';
COMMENT ON COLUMN public.game_deliveries.status IS 'draft / published / archived / canceled.';
COMMENT ON COLUMN public.game_deliveries.published_at IS 'Timestamp when learners can access this delivery.';
COMMENT ON COLUMN public.game_deliveries.archived_at IS 'Timestamp when delivery was archived.';

ALTER TABLE public.game_runs
  ADD COLUMN IF NOT EXISTS game_delivery_id uuid;

ALTER TABLE public.game_runs
  ADD COLUMN IF NOT EXISTS run_context public.game_run_context;

COMMENT ON COLUMN public.game_runs.game_delivery_id IS
  'Optional rollout context for assigned runs. Must align with institution, game, and game_version when present.';
COMMENT ON COLUMN public.game_runs.run_context IS
  'Explicit run segmentation: delivery_assigned, solo_library, versus_invite, teacher_launched_session.';

ALTER TABLE public.learning_events
  ADD COLUMN IF NOT EXISTS game_delivery_id uuid;

COMMENT ON COLUMN public.learning_events.game_delivery_id IS
  'Optional game rollout context for game-linked events to support delivery-scoped analytics.';

CREATE TABLE IF NOT EXISTS public.game_run_stats_scoped (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  user_id uuid NOT NULL,
  game_id uuid NOT NULL,
  game_version_id uuid NOT NULL,
  game_delivery_id uuid,
  best_score integer NOT NULL DEFAULT 0,
  best_run_id uuid,
  attempt_count integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_run_stats_scoped IS
  'Derived scoped leaderboard state. Source of truth for best-per-version and optional best-per-delivery metrics.';
COMMENT ON COLUMN public.game_run_stats_scoped.game_delivery_id IS
  'Nullable for version-wide scope; non-null for delivery-specific scope.';
COMMENT ON COLUMN public.game_run_stats_scoped.best_run_id IS
  'Run that produced the best_score for the scope key.';
