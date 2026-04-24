-- =============================================================================
-- Break RLS recursion between public.classrooms and public.classroom_members.
-- classrooms_select_member referenced classroom_members; primary-teacher and
-- roster policies on classroom_members subqueried classrooms — Postgres still
-- evaluates all permissive policies on classrooms (e.g. for institution_admin
-- who is also a member), causing infinite recursion (42P17).
--
-- Pattern: SECURITY DEFINER + SET search_path = '' + SET row_security = off;
-- scoped by auth.uid() / row ids only. See docs/architecture/db_principles.md.
-- =============================================================================

CREATE OR REPLACE FUNCTION app.auth_has_active_classroom_membership(p_classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classroom_members cm
    WHERE cm.classroom_id = p_classroom_id
      AND cm.user_id = (SELECT auth.uid())
      AND cm.withdrawn_at IS NULL
  )
$$;

COMMENT ON FUNCTION app.auth_has_active_classroom_membership(uuid) IS
  'True when caller has an active classroom_members row for the classroom. SECURITY DEFINER breaks classrooms↔classroom_members RLS cycles; scoped by auth.uid().';

CREATE OR REPLACE FUNCTION app.auth_is_primary_teacher_of_classroom(p_classroom_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classrooms c
    WHERE c.id = p_classroom_id
      AND c.primary_teacher_id = (SELECT auth.uid())
  )
$$;

COMMENT ON FUNCTION app.auth_is_primary_teacher_of_classroom(uuid) IS
  'True when caller is classrooms.primary_teacher_id for the row. SECURITY DEFINER avoids RLS re-entry from classroom_members policies.';

CREATE OR REPLACE FUNCTION app.classroom_institution_id(p_classroom_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT c.institution_id
  FROM public.classrooms c
  WHERE c.id = p_classroom_id
$$;

COMMENT ON FUNCTION app.classroom_institution_id(uuid) IS
  'Institution id for a classroom (or NULL if missing). SECURITY DEFINER for WITH CHECK on classroom_members without re-entering classrooms RLS.';

GRANT EXECUTE ON FUNCTION app.auth_has_active_classroom_membership(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app.auth_is_primary_teacher_of_classroom(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app.classroom_institution_id(uuid) TO authenticated;

-- Policies: drop and recreate with helpers (names unchanged).

DROP POLICY IF EXISTS classrooms_select_member ON public.classrooms;
CREATE POLICY classrooms_select_member ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    institution_id IN (SELECT app.member_institution_ids())
    AND (
      primary_teacher_id = (SELECT app.auth_uid())
      OR app.auth_has_active_classroom_membership(id)
    )
  );

DROP POLICY IF EXISTS classroom_members_all_primary_teacher ON public.classroom_members;
CREATE POLICY classroom_members_all_primary_teacher ON public.classroom_members
  FOR ALL TO authenticated
  USING (app.auth_is_primary_teacher_of_classroom(classroom_id))
  WITH CHECK (
    app.auth_is_primary_teacher_of_classroom(classroom_id)
    AND institution_id = app.classroom_institution_id(classroom_id)
  );

DROP POLICY IF EXISTS classroom_members_select_teacher_roster ON public.classroom_members;
CREATE POLICY classroom_members_select_teacher_roster ON public.classroom_members
  FOR SELECT TO authenticated
  USING (
    app.auth_is_primary_teacher_of_classroom(classroom_members.classroom_id)
    OR EXISTS (
      SELECT 1
      FROM public.classroom_members cm_lead
      WHERE cm_lead.classroom_id = classroom_members.classroom_id
        AND cm_lead.user_id = (SELECT app.auth_uid())
        AND cm_lead.withdrawn_at IS NULL
        AND cm_lead.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

-- Harden: list_active_classroom_ids is used inside many RLS policies; invoker
-- semantics re-applied classroom_members RLS and could interact badly with
-- nested policy checks. Same semantics, bypass RLS only inside this scan.

CREATE OR REPLACE FUNCTION app.list_active_classroom_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT cm.classroom_id
  FROM public.classroom_members cm
  WHERE cm.user_id = (SELECT auth.uid())
    AND cm.withdrawn_at IS NULL
$$;

COMMENT ON FUNCTION app.list_active_classroom_ids() IS
  'Classroom IDs where the caller has an active (non-withdrawn) classroom_members row. SECURITY DEFINER with row_security off only for this scan (avoids RLS nesting issues in policies). Does not list classrooms where the user is only classrooms.primary_teacher_id — the app should insert the primary teacher into classroom_members for consistent membership scoping.';

GRANT EXECUTE ON FUNCTION app.list_active_classroom_ids() TO authenticated;
