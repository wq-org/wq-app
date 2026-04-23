-- =============================================================================
-- GAME VERSIONS — RLS policies
-- Requires: 20260326000003_game_versions_01_tables,
--           20260326000003_game_versions_05_triggers
-- =============================================================================

ALTER TABLE public.game_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_versions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS game_versions_all_super_admin ON public.game_versions;
CREATE POLICY game_versions_all_super_admin ON public.game_versions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

-- Teachers manage the versions of their own games.
DROP POLICY IF EXISTS game_versions_select_teacher ON public.game_versions;
CREATE POLICY game_versions_select_teacher ON public.game_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.games g
      WHERE g.id = game_versions.game_id
        AND g.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS game_versions_insert_teacher ON public.game_versions;
CREATE POLICY game_versions_insert_teacher ON public.game_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'draft'
    AND created_by = (SELECT app.auth_uid())
    AND EXISTS (
      SELECT 1
      FROM public.games g
      WHERE g.id = game_versions.game_id
        AND g.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS game_versions_update_teacher ON public.game_versions;
CREATE POLICY game_versions_update_teacher ON public.game_versions
  FOR UPDATE TO authenticated
  USING (
    status = 'draft'
    AND EXISTS (
      SELECT 1
      FROM public.games g
      WHERE g.id = game_versions.game_id
        AND g.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    status = 'draft'
    AND EXISTS (
      SELECT 1
      FROM public.games g
      WHERE g.id = game_versions.game_id
        AND g.teacher_id = (SELECT app.auth_uid())
    )
  );

-- Institution admins can inspect every version in their institutions.
DROP POLICY IF EXISTS game_versions_select_institution_admin ON public.game_versions;
CREATE POLICY game_versions_select_institution_admin ON public.game_versions
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- Active institution members can read published versions from their institutions.
DROP POLICY IF EXISTS game_versions_select_member_published ON public.game_versions;
CREATE POLICY game_versions_select_member_published ON public.game_versions
  FOR SELECT TO authenticated
  USING (
    status = 'published'
    AND institution_id IN (SELECT app.member_institution_ids())
  );

-- Historical runs should still resolve the exact version they used.
DROP POLICY IF EXISTS game_versions_select_run_access ON public.game_versions;
CREATE POLICY game_versions_select_run_access ON public.game_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.game_runs gr
      WHERE gr.game_version_id = game_versions.id
        AND (
          (
            gr.classroom_id IS NULL
            AND gr.institution_id IN (SELECT app.member_institution_ids())
          )
          OR (
            gr.classroom_id IS NOT NULL
            AND EXISTS (
              SELECT 1
              FROM public.classroom_members cm
              WHERE cm.classroom_id = gr.classroom_id
                AND cm.user_id = (SELECT app.auth_uid())
                AND cm.withdrawn_at IS NULL
            )
          )
          OR gr.started_by = (SELECT app.auth_uid())
          OR gr.game_id IN (
            SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid())
          )
        )
    )
  );

-- Keep the games published-view policy aligned with the stable published pointer.
DROP POLICY IF EXISTS games_select_authenticated_published ON public.games;
CREATE POLICY games_select_authenticated_published ON public.games
  FOR SELECT TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR (
      current_published_version_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.game_versions game_versions_row
        WHERE game_versions_row.id = games.current_published_version_id
          AND game_versions_row.game_id = games.id
          AND game_versions_row.status = 'published'
      )
      AND (
        institution_id IS NULL
        OR institution_id IN (SELECT app.member_institution_ids())
      )
    )
  );
