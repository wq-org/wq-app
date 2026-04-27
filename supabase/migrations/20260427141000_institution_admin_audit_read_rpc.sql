-- =============================================================================
-- INSTITUTION AUDIT ACCESS — institution-admin scoped read + RPC
-- =============================================================================
-- Purpose
--   Grants institution-admin scoped read access to `audit.events` and exposes
--   a safe RPC (`public.list_institution_audit_events`) for the UI to fetch the
--   current institution's audit stream.
--
-- Prerequisites (must already exist before this migration runs)
--   - Table: `audit.events` with RLS enabled.
--   - Helper functions:
--       `app.get_current_institution_id()`
--       `app.is_institution_admin(uuid)`
--   - Role: `authenticated`.
--   - Audit data writer pipeline (triggers/functions) should already be in
--     place so the RPC returns meaningful data.
--
-- Execution / ordering notes
--   - Run after creation of `audit.events` and app auth helper functions.
--   - Policy is recreated using `DROP POLICY IF EXISTS` for idempotent reruns.
--   - Function is recreated with `CREATE OR REPLACE FUNCTION`.
--
-- Security behavior
--   - Policy allows SELECT only when row `institution_id` is present and the
--     caller is institution admin for that institution.
--   - RPC additionally enforces:
--       1) current-institution scoping
--       2) institution-admin check
--       3) visibility filter excluding `metadata.visibility_level=security_only`
--   - Limit parameter is clamped to [1..1000] to avoid unbounded reads.

DROP POLICY IF EXISTS events_select_institution_admin ON audit.events;
CREATE POLICY events_select_institution_admin ON audit.events
  FOR SELECT TO authenticated
  USING (
    institution_id IS NOT NULL
    AND (SELECT app.is_institution_admin(institution_id)) IS TRUE
  );

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
  WHERE e.institution_id = (SELECT app.get_current_institution_id())
    AND (SELECT app.is_institution_admin(e.institution_id)) IS TRUE
    AND COALESCE(e.metadata->>'visibility_level', 'institution_admin') <> 'security_only'
  ORDER BY e.occurred_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 300), 1), 1000);
$$;

COMMENT ON FUNCTION public.list_institution_audit_events(integer) IS
  'Institution admin: recent audit.events for active institution, newest first.';

REVOKE ALL ON FUNCTION public.list_institution_audit_events(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_institution_audit_events(integer) TO authenticated;
