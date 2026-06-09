-- =============================================================================
-- Break RLS recursion on public.game_deliveries.
-- game_deliveries_select_member calls app.student_can_access_game_delivery(),
-- which queried public.game_deliveries under RLS — re-entering the same policy
-- and causing stack depth exceeded (500 from PostgREST).
--
-- Pattern: SECURITY DEFINER + SET search_path = '' + SET row_security = off,
-- scoped by p_game_delivery_id and auth.uid() only.
-- See 20260504000000_games_rls_break_recursion_with_game_versions.sql.
-- =============================================================================

CREATE OR REPLACE FUNCTION app.student_can_access_game_delivery(p_game_delivery_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.game_deliveries gd
    LEFT JOIN public.classroom_members cm
      ON cm.classroom_id = gd.classroom_id
     AND cm.user_id = (SELECT app.auth_uid())
     AND cm.withdrawn_at IS NULL
    WHERE gd.id = p_game_delivery_id
      AND gd.archived_at IS NULL
      AND gd.status = 'published'::public.game_delivery_status
      AND gd.institution_id IN (SELECT app.member_institution_ids())
      AND (
        gd.classroom_id IS NULL
        OR cm.user_id IS NOT NULL
      )
  )
$$;

COMMENT ON FUNCTION app.student_can_access_game_delivery(uuid) IS
  'True when caller may access a published game_delivery in their institution and (if classroom-scoped) is an active classroom member. SECURITY DEFINER with row_security off only for this scan to break game_deliveries RLS self-recursion; scoped by p_game_delivery_id and auth.uid().';

REVOKE ALL ON FUNCTION app.student_can_access_game_delivery(uuid) FROM public;
GRANT EXECUTE ON FUNCTION app.student_can_access_game_delivery(uuid) TO authenticated;
