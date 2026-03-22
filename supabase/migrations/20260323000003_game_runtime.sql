-- =============================================================================
-- PHASE C — Game runtime tables (MVP)
--
-- Doc map:
--   08_Game_Studio → game_runs, game_sessions, game_session_participants
--   db_guide_line_en.md → FORCE RLS, institution_id, COMMENT ON
--
-- Requires: 20260321000002 (classrooms, institution_memberships, app.*)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE game_run_mode AS ENUM ('solo', 'versus', 'classroom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE game_run_status AS ENUM ('lobby', 'active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 2. GAME_RUNS — top-level play event
-- =============================================================================
CREATE TABLE public.game_runs (
  id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         uuid            NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  institution_id  uuid            NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid            REFERENCES public.classrooms(id) ON DELETE SET NULL,
  mode            game_run_mode   NOT NULL DEFAULT 'solo',
  status          game_run_status NOT NULL DEFAULT 'lobby',
  started_by      uuid            NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invite_code     text,
  started_at      timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz     NOT NULL DEFAULT now(),
  updated_at      timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.game_runs                IS 'A game play event: solo attempt, 1-v-1 match, or teacher-launched class session (doc 08).';
COMMENT ON COLUMN public.game_runs.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.game_runs.classroom_id   IS 'Set for teacher-launched class sessions; NULL for ad-hoc play.';
COMMENT ON COLUMN public.game_runs.invite_code    IS 'Short code for versus mode lobby join.';
COMMENT ON COLUMN public.game_runs.started_by     IS 'User who initiated the run.';

CREATE INDEX idx_game_runs_game        ON public.game_runs (game_id);
CREATE INDEX idx_game_runs_institution ON public.game_runs (institution_id);
CREATE INDEX idx_game_runs_classroom   ON public.game_runs (classroom_id) WHERE classroom_id IS NOT NULL;
CREATE INDEX idx_game_runs_started_by  ON public.game_runs (started_by);

ALTER TABLE public.game_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_runs FORCE ROW LEVEL SECURITY;

CREATE POLICY gr_super_admin ON public.game_runs
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY gr_institution_admin_read ON public.game_runs
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- Teachers can manage runs they started or for their games.
CREATE POLICY gr_teacher_manage ON public.game_runs
  FOR ALL TO authenticated
  USING (
    started_by = (select app.auth_uid())
    OR game_id IN (SELECT id FROM public.games WHERE teacher_id = (select app.auth_uid()))
  )
  WITH CHECK (
    started_by = (select app.auth_uid())
    OR game_id IN (SELECT id FROM public.games WHERE teacher_id = (select app.auth_uid()))
  );

-- Members read runs: institution-wide for solo/versus; classroom runs only if assigned to that classroom.
CREATE POLICY gr_member_read ON public.game_runs
  FOR SELECT TO authenticated
  USING (
    (
      classroom_id IS NULL
      AND institution_id IN (select app.member_institution_ids())
    )
    OR (
      classroom_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.classroom_members cm
        WHERE cm.classroom_id = game_runs.classroom_id
          AND cm.user_id = (select app.auth_uid())
          AND cm.withdrawn_at IS NULL
      )
    )
  );

DROP TRIGGER IF EXISTS game_runs_updated_at ON public.game_runs;
CREATE TRIGGER game_runs_updated_at
  BEFORE UPDATE ON public.game_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 3. GAME_SESSIONS — a play-through within a run (e.g. each round / rematch)
-- =============================================================================
CREATE TABLE public.game_sessions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_run_id     uuid        NOT NULL REFERENCES public.game_runs(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  round_number    integer     NOT NULL DEFAULT 1,
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.game_sessions                IS 'A round / rematch within a game_run (doc 08).';
COMMENT ON COLUMN public.game_sessions.institution_id IS 'Tenant boundary; must match parent game_run.';
COMMENT ON COLUMN public.game_sessions.round_number   IS 'Sequential round within the run.';

CREATE INDEX idx_game_sessions_run         ON public.game_sessions (game_run_id);
CREATE INDEX idx_game_sessions_institution ON public.game_sessions (institution_id);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions FORCE ROW LEVEL SECURITY;

CREATE POLICY gs_super_admin ON public.game_sessions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY gs_institution_admin_read ON public.game_sessions
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- Participants and teachers can manage sessions for runs they have access to.
CREATE POLICY gs_run_access ON public.game_sessions
  FOR ALL TO authenticated
  USING (
    game_run_id IN (
      SELECT id FROM public.game_runs gr
      WHERE gr.started_by = (select app.auth_uid())
        OR gr.game_id IN (SELECT id FROM public.games WHERE teacher_id = (select app.auth_uid()))
    )
  )
  WITH CHECK (
    game_run_id IN (
      SELECT id FROM public.game_runs gr
      WHERE gr.started_by = (select app.auth_uid())
        OR gr.game_id IN (SELECT id FROM public.games WHERE teacher_id = (select app.auth_uid()))
    )
  );

CREATE POLICY gs_member_read ON public.game_sessions
  FOR SELECT TO authenticated
  USING (
    game_run_id IN (
      SELECT gr.id FROM public.game_runs gr
      WHERE (
        gr.classroom_id IS NULL
        AND gr.institution_id IN (select app.member_institution_ids())
      )
      OR (
        gr.classroom_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.classroom_members cm
          WHERE cm.classroom_id = gr.classroom_id
            AND cm.user_id = (select app.auth_uid())
            AND cm.withdrawn_at IS NULL
        )
      )
    )
  );

-- =============================================================================
-- 4. GAME_SESSION_PARTICIPANTS — per-player results in a session
-- =============================================================================
CREATE TABLE public.game_session_participants (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id uuid        NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  score           integer     NOT NULL DEFAULT 0,
  scores_detail   jsonb,
  is_personal_best boolean   NOT NULL DEFAULT false,
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.game_session_participants                  IS 'Per-player score and results within a game session (doc 08).';
COMMENT ON COLUMN public.game_session_participants.institution_id   IS 'Tenant boundary.';
COMMENT ON COLUMN public.game_session_participants.score            IS 'Final score: sum of node scores + bonuses + multipliers.';
COMMENT ON COLUMN public.game_session_participants.scores_detail    IS 'Per-node breakdown: [{node_id, correct, time_ms, base, bonus, multiplier, total}].';
COMMENT ON COLUMN public.game_session_participants.is_personal_best IS 'True if this score is the player''s best for this game.';

CREATE UNIQUE INDEX idx_gsp_session_user
  ON public.game_session_participants (game_session_id, user_id);

CREATE INDEX idx_gsp_institution ON public.game_session_participants (institution_id);
CREATE INDEX idx_gsp_user        ON public.game_session_participants (user_id);

ALTER TABLE public.game_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_session_participants FORCE ROW LEVEL SECURITY;

CREATE POLICY gsp_super_admin ON public.game_session_participants
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY gsp_institution_admin_read ON public.game_session_participants
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- Players manage their own participation.
CREATE POLICY gsp_own ON public.game_session_participants
  FOR ALL TO authenticated
  USING  (user_id = (select app.auth_uid()))
  WITH CHECK (user_id = (select app.auth_uid()));

-- Teachers can read results for games they own.
CREATE POLICY gsp_teacher_read ON public.game_session_participants
  FOR SELECT TO authenticated
  USING (
    game_session_id IN (
      SELECT gs.id FROM public.game_sessions gs
      JOIN public.game_runs gr ON gs.game_run_id = gr.id
      WHERE gr.game_id IN (SELECT id FROM public.games WHERE teacher_id = (select app.auth_uid()))
    )
  );

-- Leaderboards: same visibility as parent game_run (solo/versus vs classroom-scoped).
CREATE POLICY gsp_member_read ON public.game_session_participants
  FOR SELECT TO authenticated
  USING (
    game_session_id IN (
      SELECT gs.id
      FROM public.game_sessions gs
      JOIN public.game_runs gr ON gr.id = gs.game_run_id
      WHERE (
        gr.classroom_id IS NULL
        AND gr.institution_id IN (select app.member_institution_ids())
      )
      OR (
        gr.classroom_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.classroom_members cm
          WHERE cm.classroom_id = gr.classroom_id
            AND cm.user_id = (select app.auth_uid())
            AND cm.withdrawn_at IS NULL
        )
      )
    )
  );
