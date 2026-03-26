-- =============================================================================
-- GAME RUNTIME — CREATE INDEX / CREATE UNIQUE INDEX
-- Split from 20260323000003_game_runtime.sql
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

-- game_runs indexes
CREATE INDEX idx_game_runs_game_id        ON public.game_runs (game_id);
CREATE INDEX idx_game_runs_institution_id ON public.game_runs (institution_id);
CREATE INDEX idx_game_runs_classroom_id   ON public.game_runs (classroom_id) WHERE classroom_id IS NOT NULL;
CREATE INDEX idx_game_runs_started_by  ON public.game_runs (started_by);

-- game_sessions indexes
CREATE INDEX idx_game_sessions_game_run_id         ON public.game_sessions (game_run_id);
CREATE INDEX idx_game_sessions_institution_id ON public.game_sessions (institution_id);

-- game_session_participants indexes
CREATE UNIQUE INDEX idx_game_session_participants_game_session_id_user_id
  ON public.game_session_participants (game_session_id, user_id);

CREATE INDEX idx_game_session_participants_institution_id ON public.game_session_participants (institution_id);
CREATE INDEX idx_game_session_participants_user_id        ON public.game_session_participants (user_id);
