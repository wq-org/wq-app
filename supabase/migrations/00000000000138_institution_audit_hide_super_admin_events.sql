-- =============================================================================
-- INSTITUTION AUDIT READ — hide super_admin visibility from institution admins
-- =============================================================================
-- list_institution_audit_events scoped by institution_id but only excluded
-- visibility_level = security_only. Events tagged super_admin (e.g.
-- super_admin.lesson.read from migration 135) still carry the tenant
-- institution_id, so they leaked into the institution-admin UI.
--
-- Per principle_dsgvo_audit_datendefinition.md visibility levels classify the
-- audience: institution admins may only read institution_admin events.

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
    AND COALESCE(e.metadata->>'visibility_level', 'institution_admin') = 'institution_admin'
  ORDER BY e.occurred_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 300), 1), 1000);
$$;

COMMENT ON FUNCTION public.list_institution_audit_events(integer) IS
  'Institution admin: tenant-scoped audit.events with visibility_level institution_admin only.';

REVOKE ALL ON FUNCTION public.list_institution_audit_events(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_institution_audit_events(integer) TO authenticated;
