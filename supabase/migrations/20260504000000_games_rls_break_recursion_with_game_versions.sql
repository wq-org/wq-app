-- =============================================================================
-- Break RLS recursion between public.games and public.game_versions.
-- games_select_authenticated_published referenced game_versions; game_versions
-- policies (select_teacher / insert_teacher / update_teacher / select_run_access)
-- referenced games — Postgres still evaluates all permissive policies on each
-- side, causing infinite recursion (42P17) when loading games (e.g. the teacher
-- Game Studio list).
--
-- Pattern: SECURITY DEFINER + SET search_path = '' + SET row_security = off,
-- scoped strictly by row id (and auth.uid() where the policy already required it).
-- See docs/architecture/db_principles.md (Pre-implementation checklist — RLS
-- recursion and helper traps) and 20260424120000_classrooms_rls_break_recursion.sql.
-- =============================================================================

-- ── Helpers ──────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION app.game_has_published_pointer(p_game_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.games g
    INNER JOIN public.game_versions gv
      ON gv.id = g.current_published_version_id
    WHERE g.id = p_game_id
      AND g.current_published_version_id IS NOT NULL
      AND gv.game_id = g.id
      AND gv.status = 'published'
  )
$$;

COMMENT ON FUNCTION app.game_has_published_pointer(uuid) IS
  'True when public.games.current_published_version_id points at a published public.game_versions row for the same game. SECURITY DEFINER with row_security off only for this scan to break the games↔game_versions RLS cycle; scoped by p_game_id only.';

CREATE OR REPLACE FUNCTION app.game_teacher_id(p_game_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT g.teacher_id
  FROM public.games g
  WHERE g.id = p_game_id
$$;

COMMENT ON FUNCTION app.game_teacher_id(uuid) IS
  'Returns public.games.teacher_id for a game (or NULL if missing). SECURITY DEFINER with row_security off only for this scan to break the games↔game_versions RLS cycle; scoped by p_game_id only.';

GRANT EXECUTE ON FUNCTION app.game_has_published_pointer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app.game_teacher_id(uuid) TO authenticated;

-- ── public.games ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS games_select_authenticated_published ON public.games;
CREATE POLICY games_select_authenticated_published ON public.games
  FOR SELECT TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR (
      current_published_version_id IS NOT NULL
      AND app.game_has_published_pointer(id)
      AND (
        institution_id IS NULL
        OR institution_id IN (SELECT app.member_institution_ids())
      )
    )
  );

-- ── public.game_versions ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS game_versions_select_teacher ON public.game_versions;
CREATE POLICY game_versions_select_teacher ON public.game_versions
  FOR SELECT TO authenticated
  USING (
    app.game_teacher_id(game_versions.game_id) = (SELECT app.auth_uid())
  );

DROP POLICY IF EXISTS game_versions_insert_teacher ON public.game_versions;
CREATE POLICY game_versions_insert_teacher ON public.game_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'draft'
    AND created_by = (SELECT app.auth_uid())
    AND app.game_teacher_id(game_versions.game_id) = (SELECT app.auth_uid())
  );

DROP POLICY IF EXISTS game_versions_update_teacher ON public.game_versions;
CREATE POLICY game_versions_update_teacher ON public.game_versions
  FOR UPDATE TO authenticated
  USING (
    status = 'draft'
    AND app.game_teacher_id(game_versions.game_id) = (SELECT app.auth_uid())
  )
  WITH CHECK (
    status = 'draft'
    AND app.game_teacher_id(game_versions.game_id) = (SELECT app.auth_uid())
  );

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
          OR app.game_teacher_id(gr.game_id) = (SELECT app.auth_uid())
        )
    )
  );
