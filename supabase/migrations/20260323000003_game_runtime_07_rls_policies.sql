-- =============================================================================
-- GAME RUNTIME — ENABLE/FORCE RLS, DROP/CREATE POLICY
-- Split from 20260323000003_game_runtime.sql
-- Requires: 20260321000002_institution_admin (all parts), 20260323000002 (all parts)
-- =============================================================================

-- ── game_runs RLS ────────────────────────────────────────────────────────────

ALTER TABLE public.game_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_runs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gr_super_admin ON public.game_runs;
DROP POLICY IF EXISTS game_runs_all_super_admin ON public.game_runs;
CREATE POLICY game_runs_all_super_admin ON public.game_runs
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS gr_institution_admin_read ON public.game_runs;
DROP POLICY IF EXISTS game_runs_select_institution_admin ON public.game_runs;
CREATE POLICY game_runs_select_institution_admin ON public.game_runs
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- Teachers can manage runs they started or for their games.
DROP POLICY IF EXISTS gr_teacher_manage ON public.game_runs;
DROP POLICY IF EXISTS game_runs_all_teacher ON public.game_runs;
CREATE POLICY game_runs_all_teacher ON public.game_runs
  FOR ALL TO authenticated
  USING (
    started_by = (SELECT app.auth_uid())
    OR game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
  )
  WITH CHECK (
    started_by = (SELECT app.auth_uid())
    OR game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
  );

-- Members read runs: institution-wide for solo/versus; classroom runs only if assigned to that classroom.
DROP POLICY IF EXISTS gr_member_read ON public.game_runs;
DROP POLICY IF EXISTS game_runs_select_member ON public.game_runs;
CREATE POLICY game_runs_select_member ON public.game_runs
  FOR SELECT TO authenticated
  USING (
    (
      classroom_id IS NULL
      AND institution_id IN (SELECT app.member_institution_ids())
    )
    OR (
      classroom_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.classroom_members cm
        WHERE cm.classroom_id = game_runs.classroom_id
          AND cm.user_id = (SELECT app.auth_uid())
          AND cm.withdrawn_at IS NULL
      )
    )
  );

-- ── game_sessions RLS ────────────────────────────────────────────────────────

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gs_super_admin ON public.game_sessions;
DROP POLICY IF EXISTS game_sessions_all_super_admin ON public.game_sessions;
CREATE POLICY game_sessions_all_super_admin ON public.game_sessions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS gs_institution_admin_read ON public.game_sessions;
DROP POLICY IF EXISTS game_sessions_select_institution_admin ON public.game_sessions;
CREATE POLICY game_sessions_select_institution_admin ON public.game_sessions
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- Participants and teachers can manage sessions for runs they have access to.
DROP POLICY IF EXISTS gs_run_access ON public.game_sessions;
DROP POLICY IF EXISTS game_sessions_all_run_access ON public.game_sessions;
CREATE POLICY game_sessions_all_run_access ON public.game_sessions
  FOR ALL TO authenticated
  USING (
    game_run_id IN (
      SELECT id FROM public.game_runs gr
      WHERE gr.started_by = (SELECT app.auth_uid())
        OR gr.game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    )
  )
  WITH CHECK (
    game_run_id IN (
      SELECT id FROM public.game_runs gr
      WHERE gr.started_by = (SELECT app.auth_uid())
        OR gr.game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    )
  );

DROP POLICY IF EXISTS gs_member_read ON public.game_sessions;
DROP POLICY IF EXISTS game_sessions_select_member ON public.game_sessions;
CREATE POLICY game_sessions_select_member ON public.game_sessions
  FOR SELECT TO authenticated
  USING (
    game_run_id IN (
      SELECT gr.id FROM public.game_runs gr
      WHERE (
        gr.classroom_id IS NULL
        AND gr.institution_id IN (SELECT app.member_institution_ids())
      )
      OR (
        gr.classroom_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.classroom_members cm
          WHERE cm.classroom_id = gr.classroom_id
            AND cm.user_id = (SELECT app.auth_uid())
            AND cm.withdrawn_at IS NULL
        )
      )
    )
  );

-- ── game_session_participants RLS ────────────────────────────────────────────

ALTER TABLE public.game_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_session_participants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gsp_super_admin ON public.game_session_participants;
DROP POLICY IF EXISTS game_session_participants_all_super_admin ON public.game_session_participants;
CREATE POLICY game_session_participants_all_super_admin ON public.game_session_participants
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS gsp_institution_admin_read ON public.game_session_participants;
DROP POLICY IF EXISTS game_session_participants_select_institution_admin ON public.game_session_participants;
CREATE POLICY game_session_participants_select_institution_admin ON public.game_session_participants
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- Players manage their own participation.
DROP POLICY IF EXISTS gsp_own ON public.game_session_participants;
DROP POLICY IF EXISTS game_session_participants_all_own ON public.game_session_participants;
CREATE POLICY game_session_participants_all_own ON public.game_session_participants
  FOR ALL TO authenticated
  USING (user_id = (SELECT app.auth_uid()))
  WITH CHECK (user_id = (SELECT app.auth_uid()));

-- Teachers can read results for games they own.
DROP POLICY IF EXISTS gsp_teacher_read ON public.game_session_participants;
DROP POLICY IF EXISTS game_session_participants_select_teacher ON public.game_session_participants;
CREATE POLICY game_session_participants_select_teacher ON public.game_session_participants
  FOR SELECT TO authenticated
  USING (
    game_session_id IN (
      SELECT gs.id FROM public.game_sessions gs
      INNER JOIN public.game_runs gr ON gs.game_run_id = gr.id
      WHERE gr.game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    )
  );

-- Leaderboards: same visibility as parent game_run (solo/versus vs classroom-scoped).
DROP POLICY IF EXISTS gsp_member_read ON public.game_session_participants;
DROP POLICY IF EXISTS game_session_participants_select_member ON public.game_session_participants;
CREATE POLICY game_session_participants_select_member ON public.game_session_participants
  FOR SELECT TO authenticated
  USING (
    game_session_id IN (
      SELECT gs.id
      FROM public.game_sessions gs
      INNER JOIN public.game_runs gr ON gs.game_run_id = gr.id
      WHERE (
        gr.classroom_id IS NULL
        AND gr.institution_id IN (SELECT app.member_institution_ids())
      )
      OR (
        gr.classroom_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.classroom_members cm
          WHERE cm.classroom_id = gr.classroom_id
            AND cm.user_id = (SELECT app.auth_uid())
            AND cm.withdrawn_at IS NULL
        )
      )
    )
  );
