-- =============================================================================
-- SUPER ADMIN — Functions and RPCs
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_event(
  p_event_type     text,
  p_subject_type   text  DEFAULT NULL,
  p_subject_id     uuid  DEFAULT NULL,
  p_institution_id uuid  DEFAULT NULL,
  p_payload        jsonb DEFAULT NULL,
  p_metadata       jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO audit.events
    (actor_user_id, event_type, subject_type, subject_id, institution_id, payload, metadata)
  VALUES
    (auth.uid(), p_event_type, p_subject_type, p_subject_id, p_institution_id, p_payload, p_metadata)
  RETURNING id
$$;

COMMENT ON FUNCTION audit.log_event IS
  'Insert an audit event. Direct table writes are revoked; use this function.';
