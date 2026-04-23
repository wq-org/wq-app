-- =============================================================================
-- Fix recursive RLS when resolving institution_memberships inside policies that
-- call app.member_institution_ids() / app.admin_institution_ids(): PostgreSQL
-- error 54001 (stack depth limit exceeded). Helpers must read membership rows
-- without re-entering RLS on the same table.
--
-- Pattern: SECURITY DEFINER with fixed search_path; SET row_security = off for
-- the function body only; caller identity via auth.uid() (JWT), not caller-supplied ids.
-- See docs/architecture/db_principles.md (SECURITY DEFINER + safe search_path).
-- =============================================================================

CREATE OR REPLACE FUNCTION app.admin_institution_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT m.institution_id
  FROM public.institution_memberships m
  WHERE m.user_id = (SELECT auth.uid())
    AND m.membership_role = 'institution_admin'::public.membership_role
    AND m.status = 'active'::public.membership_status
    AND m.deleted_at IS NULL
    AND m.left_institution_at IS NULL
$$;

COMMENT ON FUNCTION app.admin_institution_ids() IS
  'Institution IDs where the caller is an active institution_admin. SECURITY DEFINER with row_security off only for this scan to avoid RLS recursion; scoped by auth.uid().';

CREATE OR REPLACE FUNCTION app.member_institution_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT m.institution_id
  FROM public.institution_memberships m
  WHERE m.user_id = (SELECT auth.uid())
    AND m.status = 'active'::public.membership_status
    AND m.deleted_at IS NULL
    AND m.left_institution_at IS NULL
$$;

COMMENT ON FUNCTION app.member_institution_ids() IS
  'Institution IDs where the caller has any active membership. SECURITY DEFINER with row_security off only for this scan to avoid RLS recursion; scoped by auth.uid().';

CREATE OR REPLACE FUNCTION app.is_institution_admin(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.institution_memberships m
    WHERE m.institution_id = p_institution_id
      AND m.user_id = (SELECT auth.uid())
      AND m.membership_role = 'institution_admin'::public.membership_role
      AND m.status = 'active'::public.membership_status
      AND m.deleted_at IS NULL
      AND m.left_institution_at IS NULL
  )
$$;

COMMENT ON FUNCTION app.is_institution_admin(uuid) IS
  'True when caller is an active institution_admin for the institution. SECURITY DEFINER avoids RLS recursion on institution_memberships; scoped by auth.uid().';

CREATE OR REPLACE FUNCTION app.is_institution_member(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.institution_memberships m
    WHERE m.institution_id = p_institution_id
      AND m.user_id = (SELECT auth.uid())
      AND m.status = 'active'::public.membership_status
      AND m.deleted_at IS NULL
      AND m.left_institution_at IS NULL
  )
$$;

COMMENT ON FUNCTION app.is_institution_member(uuid) IS
  'True when caller has any active membership in the institution. SECURITY DEFINER avoids RLS recursion on institution_memberships; scoped by auth.uid().';

REVOKE ALL ON FUNCTION app.admin_institution_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION app.member_institution_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION app.is_institution_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.is_institution_member(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app.admin_institution_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION app.member_institution_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_institution_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_institution_member(uuid) TO authenticated;
