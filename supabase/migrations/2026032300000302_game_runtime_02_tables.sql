-- =============================================================================
-- GAME RUNTIME — CREATE TABLE / ALTER TABLE ADD COLUMN
-- Split from 20260323000003_game_runtime.sql
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

-- game_runs — top-level play event
CREATE TABLE public.game_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  classroom_id uuid REFERENCES public.classrooms (id) ON DELETE SET NULL,
  mode game_run_mode NOT NULL DEFAULT 'solo',
  status game_run_status NOT NULL DEFAULT 'lobby',
  started_by uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  invite_code text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_runs IS 'A game play event: solo attempt, 1-v-1 match, or teacher-launched class session (doc 08).';
COMMENT ON COLUMN public.game_runs.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.game_runs.classroom_id IS 'Set for teacher-launched class sessions; NULL for ad-hoc play.';
COMMENT ON COLUMN public.game_runs.invite_code IS 'Short code for versus mode lobby join.';
COMMENT ON COLUMN public.game_runs.started_by IS 'User who initiated the run.';

-- game_sessions — a play-through within a run (e.g. each round / rematch)
CREATE TABLE public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_run_id uuid NOT NULL REFERENCES public.game_runs (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  round_number integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_sessions IS 'A round / rematch within a game_run (doc 08).';
COMMENT ON COLUMN public.game_sessions.institution_id IS 'Tenant boundary; must match parent game_run.';
COMMENT ON COLUMN public.game_sessions.round_number IS 'Sequential round within the run.';

-- game_session_participants — per-player results in a session
CREATE TABLE public.game_session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid NOT NULL REFERENCES public.game_sessions (id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  scores_detail jsonb,
  is_personal_best boolean NOT NULL DEFAULT FALSE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.game_session_participants IS 'Per-player score and results within a game session (doc 08).';
COMMENT ON COLUMN public.game_session_participants.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.game_session_participants.score IS 'Final score: sum of node scores + bonuses + multipliers.';
COMMENT ON COLUMN public.game_session_participants.scores_detail IS 'Per-node breakdown: [{node_id, correct, time_ms, base, bonus, multiplier, total}].';
COMMENT ON COLUMN public.game_session_participants.is_personal_best IS 'True if this score is the player''s best for this game.';
