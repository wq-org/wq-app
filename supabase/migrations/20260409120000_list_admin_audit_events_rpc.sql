-- Expose audit.events to the app via public RPC (PostgREST only serves configured schemas; audit is not exposed).
-- Super admins read the same rows as RLS on audit.events would allow.

CREATE OR REPLACE FUNCTION public.list_admin_audit_events(p_limit integer DEFAULT 300)
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
  WHERE (SELECT app.is_super_admin()) IS TRUE
  ORDER BY e.occurred_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 300), 1), 1000);
$$;

COMMENT ON FUNCTION public.list_admin_audit_events(integer) IS
  'Super admin: recent audit.events, newest first. Use from the app because PostgREST does not expose the audit schema.';

REVOKE ALL ON FUNCTION public.list_admin_audit_events(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admin_audit_events(integer) TO authenticated;
