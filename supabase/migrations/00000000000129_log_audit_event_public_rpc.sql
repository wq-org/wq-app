-- =============================================================================
-- AUDIT — public, service-role-only PostgREST entry point for audit.log_event()
-- =============================================================================
-- PostgREST only exposes the public/graphql_public schemas (PGRST_DB_SCHEMAS),
-- so trusted server contexts (edge functions using the service role key) cannot
-- reach audit.log_event() directly — supabase-js .schema('audit').rpc('log_event')
-- fails with PGRST106 ("The schema must be one of the following: public,
-- graphql_public") and surfaces as a 500.
--
-- The audit schema must stay unexposed (see principle_database.md: audit schema
-- is not served publicly). This wrapper is the single controlled public path
-- into audit.log_event(), restricted to service_role so clients can never forge
-- audit events (append-only integrity, principle_dsgvo_audit_datendefinition.md).
--
-- SECURITY DEFINER is required (not just for elevation): service_role holds
-- EXECUTE on audit.log_event but lacks USAGE on the audit schema, so a
-- SECURITY INVOKER wrapper run as service_role could not resolve the target.

-- 5. Functions/RPC
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_event_type text,
  p_subject_type text DEFAULT NULL,
  p_subject_id uuid DEFAULT NULL,
  p_institution_id uuid DEFAULT NULL,
  p_payload jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT audit.log_event(
    p_event_type,
    p_subject_type,
    p_subject_id,
    p_institution_id,
    p_payload,
    p_metadata
  );
$$;

COMMENT ON FUNCTION public.log_audit_event(text, text, uuid, uuid, jsonb, jsonb) IS
  'Service-role-only PostgREST entry point that forwards to audit.log_event(); the audit schema is not exposed to PostgREST. SECURITY DEFINER because service_role lacks USAGE on the audit schema. Restricted to service_role so clients cannot forge audit events (append-only integrity).';

REVOKE ALL ON FUNCTION public.log_audit_event(text, text, uuid, uuid, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, uuid, uuid, jsonb, jsonb) TO service_role;
