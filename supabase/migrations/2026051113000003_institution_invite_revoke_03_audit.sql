-- =============================================================================
-- INSTITUTION INVITE REVOKE — audit trigger
-- Replaces the fragile expires_at-watching branch with a canonical revoked_at
-- transition rule. The DSGVO doc (docs/architecture/dsgvo-audit-datendefinition.md)
-- already lists `invite.revoked` — this migration wires it to a real column.
--
-- Requires:
--   2026051113000001_institution_invite_revoke_01_schema.sql (revoked_at column)
--   20260427162000_institution_remaining_audit_triggers.sql (original function)
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_institution_invites_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'invite.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'invite.deleted';
  ELSE
    IF NEW.accepted_at IS NOT NULL AND OLD.accepted_at IS NULL THEN
      v_event_type := 'invite.accepted';
    ELSIF OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL THEN
      v_event_type := 'invite.revoked';
    ELSIF NEW.expires_at IS DISTINCT FROM OLD.expires_at AND NEW.expires_at > now() THEN
      v_event_type := 'invite.resent';
    ELSIF NOT (
      NEW.membership_role IS DISTINCT FROM OLD.membership_role
      OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
      OR NEW.accepted_at IS DISTINCT FROM OLD.accepted_at
      OR NEW.accepted_user_id IS DISTINCT FROM OLD.accepted_user_id
      OR NEW.revoked_at IS DISTINCT FROM OLD.revoked_at
      OR NEW.revoked_by IS DISTINCT FROM OLD.revoked_by
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'invite.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'institution_invite',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'target_role', CASE WHEN TG_OP = 'DELETE' THEN OLD.membership_role::text ELSE NEW.membership_role::text END,
      'accepted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.accepted_at ELSE NEW.accepted_at END,
      'expires_at',  CASE WHEN TG_OP = 'DELETE' THEN OLD.expires_at  ELSE NEW.expires_at  END,
      'revoked_at',  CASE WHEN TG_OP = 'DELETE' THEN OLD.revoked_at  ELSE NEW.revoked_at  END,
      'revoked_by',  CASE WHEN TG_OP = 'DELETE' THEN OLD.revoked_by  ELSE NEW.revoked_by  END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'invite_id', COALESCE(NEW.id, OLD.id),
        'accepted_user_id', COALESCE(NEW.accepted_user_id, OLD.accepted_user_id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;
