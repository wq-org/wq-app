-- =============================================================================
-- INSTITUTION AUDIT READ — scope by admin membership, not active_institution_id
-- =============================================================================
-- list_institution_audit_events previously filtered with app.get_current_institution_id(),
-- which reads profiles.active_institution_id. That column is optional context and is
-- not set on invite redeem / membership flows, so institution admins saw an empty list
-- while super admins (global RPC) still saw events.
--
-- Fix: scope to institutions where the caller is an active institution_admin
-- (app.admin_institution_ids()), matching the audit.events RLS policy intent.

CREATE OR REPLACE FUNCTION public.list_institution_audit_events(p_limit integer DEFAULT 300)
RETURNS TABLE (
  id uuid,
  occurred_at timestamptz,
  actor_user_id uuid,
  event_type text,
  subject_type text,
  subject_id uuid,
  institution_id uuid,
  payload jsonb,
  metadata jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    e.id,
    e.occurred_at,
    e.actor_user_id,
    e.event_type,
    e.subject_type,
    e.subject_id,
    e.institution_id,
    e.payload,
    e.metadata
  FROM audit.events AS e
  WHERE e.institution_id IN (SELECT app.admin_institution_ids())
    AND COALESCE(e.metadata->>'visibility_level', 'institution_admin') <> 'security_only'
  ORDER BY e.occurred_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 300), 1), 1000);
$$;

COMMENT ON FUNCTION public.list_institution_audit_events(integer) IS
  'Institution admin: recent audit.events for institutions the caller admins, newest first.';

REVOKE ALL ON FUNCTION public.list_institution_audit_events(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_institution_audit_events(integer) TO authenticated;

-- Resolve tenant context when active_institution_id was never set (invite flows, legacy data).
CREATE OR REPLACE FUNCTION app.get_current_institution_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT COALESCE(
    p.active_institution_id,
    (
      SELECT m.institution_id
      FROM public.institution_memberships AS m
      WHERE m.user_id = (SELECT auth.uid())
        AND m.membership_role = 'institution_admin'::public.membership_role
        AND m.status = 'active'::public.membership_status
        AND m.deleted_at IS NULL
        AND m.left_institution_at IS NULL
      ORDER BY m.created_at ASC, m.institution_id ASC
      LIMIT 1
    ),
    (
      SELECT m.institution_id
      FROM public.institution_memberships AS m
      WHERE m.user_id = (SELECT auth.uid())
        AND m.status = 'active'::public.membership_status
        AND m.deleted_at IS NULL
        AND m.left_institution_at IS NULL
      ORDER BY m.created_at ASC, m.institution_id ASC
      LIMIT 1
    ),
    (
      SELECT ui.institution_id
      FROM public.user_institutions AS ui
      WHERE ui.user_id = (SELECT auth.uid())
      ORDER BY ui.institution_id ASC
      LIMIT 1
    )
  )
  FROM public.profiles AS p
  WHERE p.user_id = (SELECT auth.uid())
$$;

COMMENT ON FUNCTION app.get_current_institution_id() IS
  'Active tenant: profiles.active_institution_id, else first active institution_admin membership, else first active membership, else legacy user_institutions.';

REVOKE ALL ON FUNCTION app.get_current_institution_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.get_current_institution_id() TO authenticated;
