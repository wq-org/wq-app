-- =============================================================================
-- INSTITUTION AUDIT COVERAGE — remaining lifecycle tables
-- =============================================================================
-- Purpose
--   Completes institution-admin audit coverage for membership, invites, scopes,
--   classroom members, settings, quotas, invoice records, and DSR workflows by
--   creating trigger functions and binding row-level triggers.
--
-- Prerequisites (must already exist before this migration runs)
--   - Schema/function: `audit.log_event(...)`
--   - App helper function used in trigger payload:
--       `app.is_super_admin()`
--   - Target tables:
--       `public.institution_memberships`
--       `public.institution_invites`
--       `public.institution_staff_scopes`
--       `public.classroom_members`
--       `public.institution_settings`
--       `public.institution_quotas_usage`
--       `public.institution_invoice_records`
--       `public.data_subject_requests`
--   - Expected columns referenced per function (ids, institution_id, status,
--     role/time fields, soft-delete fields, and subject-specific attributes).
--
-- Execution / ordering notes
--   - Run after base tables and enums are created.
--   - Run after the core audit foundation migration that creates
--     `audit.log_event(...)`.
--   - Safe to re-run: functions are `CREATE OR REPLACE`, triggers are dropped
--     first via `DROP TRIGGER IF EXISTS`.
--
-- Runtime behavior
--   - Emits normalized audit event types for lifecycle/state transitions
--     (e.g. suspended/reactivated, accepted/revoked, paid/overdue/completed).
--   - Ignores no-op updates where tracked fields did not change.
--   - Stores admin-facing context/visibility metadata used by the audit read RPC.

CREATE OR REPLACE FUNCTION audit.log_institution_memberships_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'membership.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'membership.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'membership.deleted';
    ELSIF NEW.left_institution_at IS NOT NULL AND OLD.left_institution_at IS NULL THEN
      v_event_type := 'membership.left';
    ELSIF NEW.status = 'suspended' AND OLD.status IS DISTINCT FROM NEW.status THEN
      v_event_type := 'membership.suspended';
    ELSIF NEW.status = 'active' AND OLD.status = 'suspended' THEN
      v_event_type := 'membership.reactivated';
    ELSIF NOT (
      NEW.membership_role IS DISTINCT FROM OLD.membership_role
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.left_institution_at IS DISTINCT FROM OLD.left_institution_at
      OR NEW.leave_reason IS DISTINCT FROM OLD.leave_reason
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'membership.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'institution_membership',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END,
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::text ELSE NULL END,
      'new_status', CASE WHEN TG_OP = 'UPDATE' THEN NEW.status::text ELSE NULL END,
      'old_role', CASE WHEN TG_OP = 'UPDATE' THEN OLD.membership_role::text ELSE NULL END,
      'new_role', CASE WHEN TG_OP = 'UPDATE' THEN NEW.membership_role::text ELSE NULL END,
      'left_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.left_institution_at ELSE NEW.left_institution_at END,
      'left_reason_code', CASE
        WHEN TG_OP = 'DELETE' THEN NULLIF(regexp_replace(COALESCE(OLD.leave_reason, ''), '[^a-z_]', '', 'g'), '')
        ELSE NULLIF(regexp_replace(COALESCE(NEW.leave_reason, ''), '[^a-z_]', '', 'g'), '')
      END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'membership_id', COALESCE(NEW.id, OLD.id),
        'user_id', COALESCE(NEW.user_id, OLD.user_id)
      ),
      'changed_fields', CASE
        WHEN TG_OP <> 'UPDATE' THEN '[]'::jsonb
        ELSE to_jsonb(
          ARRAY_REMOVE(ARRAY[
            CASE WHEN NEW.membership_role IS DISTINCT FROM OLD.membership_role THEN 'membership_role' END,
            CASE WHEN NEW.status IS DISTINCT FROM OLD.status THEN 'status' END,
            CASE WHEN NEW.left_institution_at IS DISTINCT FROM OLD.left_institution_at THEN 'left_institution_at' END,
            CASE WHEN NEW.leave_reason IS DISTINCT FROM OLD.leave_reason THEN 'leave_reason' END,
            CASE WHEN NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN 'deleted_at' END
          ], NULL)
        )
      END
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_institution_memberships_audit_row ON public.institution_memberships;
CREATE TRIGGER trg_institution_memberships_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_memberships
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_memberships_audit();

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
    ELSIF NEW.expires_at IS DISTINCT FROM OLD.expires_at AND NEW.expires_at <= now() THEN
      v_event_type := 'invite.revoked';
    ELSIF NEW.expires_at IS DISTINCT FROM OLD.expires_at AND NEW.expires_at > now() THEN
      v_event_type := 'invite.resent';
    ELSIF NOT (
      NEW.membership_role IS DISTINCT FROM OLD.membership_role
      OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
      OR NEW.accepted_at IS DISTINCT FROM OLD.accepted_at
      OR NEW.accepted_user_id IS DISTINCT FROM OLD.accepted_user_id
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
      'expires_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.expires_at ELSE NEW.expires_at END
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

DROP TRIGGER IF EXISTS trg_institution_invites_audit_row ON public.institution_invites;
CREATE TRIGGER trg_institution_invites_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_invites
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_invites_audit();

CREATE OR REPLACE FUNCTION audit.log_institution_staff_scopes_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'staff_scope.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'staff_scope.deleted';
  ELSIF NOT (
    NEW.faculty_id IS DISTINCT FROM OLD.faculty_id
    OR NEW.programme_id IS DISTINCT FROM OLD.programme_id
  ) THEN
    RETURN NEW;
  ELSE
    v_event_type := 'staff_scope.updated';
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'institution_staff_scope',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'scope_type', CASE
        WHEN COALESCE(NEW.programme_id, OLD.programme_id) IS NOT NULL THEN 'programme'
        WHEN COALESCE(NEW.faculty_id, OLD.faculty_id) IS NOT NULL THEN 'faculty'
        ELSE 'institution'
      END,
      'scope_target_id', COALESCE(NEW.programme_id, OLD.programme_id, NEW.faculty_id, OLD.faculty_id)
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'staff_scope_id', COALESCE(NEW.id, OLD.id),
        'user_id', COALESCE(NEW.user_id, OLD.user_id),
        'faculty_id', COALESCE(NEW.faculty_id, OLD.faculty_id),
        'programme_id', COALESCE(NEW.programme_id, OLD.programme_id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_institution_staff_scopes_audit_row ON public.institution_staff_scopes;
CREATE TRIGGER trg_institution_staff_scopes_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_staff_scopes
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_staff_scopes_audit();

CREATE OR REPLACE FUNCTION audit.log_classroom_members_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'classroom_member.assigned';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'classroom_member.deleted';
  ELSE
    IF NEW.withdrawn_at IS NOT NULL AND OLD.withdrawn_at IS NULL THEN
      v_event_type := 'classroom_member.withdrawn';
    ELSIF NOT (
      NEW.membership_role IS DISTINCT FROM OLD.membership_role
      OR NEW.withdrawn_at IS DISTINCT FROM OLD.withdrawn_at
      OR NEW.leave_reason IS DISTINCT FROM OLD.leave_reason
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'classroom_member.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'classroom_member',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'membership_role', CASE WHEN TG_OP = 'DELETE' THEN OLD.membership_role::text ELSE NEW.membership_role::text END,
      'withdrawn_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.withdrawn_at ELSE NEW.withdrawn_at END,
      'withdrawn_reason_code', CASE
        WHEN TG_OP = 'DELETE' THEN NULLIF(regexp_replace(COALESCE(OLD.leave_reason, ''), '[^a-z_]', '', 'g'), '')
        ELSE NULLIF(regexp_replace(COALESCE(NEW.leave_reason, ''), '[^a-z_]', '', 'g'), '')
      END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'classroom_member_id', COALESCE(NEW.id, OLD.id),
        'classroom_id', COALESCE(NEW.classroom_id, OLD.classroom_id),
        'user_id', COALESCE(NEW.user_id, OLD.user_id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_classroom_members_audit_row ON public.classroom_members;
CREATE TRIGGER trg_classroom_members_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.classroom_members
  FOR EACH ROW EXECUTE FUNCTION audit.log_classroom_members_audit();

CREATE OR REPLACE FUNCTION audit.log_institution_settings_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_changed_fields text[];
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_changed_fields := ARRAY_REMOVE(ARRAY[
    CASE WHEN NEW.default_locale IS DISTINCT FROM OLD.default_locale THEN 'default_locale' END,
    CASE WHEN NEW.timezone IS DISTINCT FROM OLD.timezone THEN 'timezone' END,
    CASE WHEN NEW.retention_policy_code IS DISTINCT FROM OLD.retention_policy_code THEN 'retention_policy_code' END,
    CASE WHEN NEW.notification_defaults IS DISTINCT FROM OLD.notification_defaults THEN 'notification_defaults' END
  ], NULL);

  IF COALESCE(array_length(v_changed_fields, 1), 0) = 0 THEN
    RETURN NEW;
  END IF;

  PERFORM audit.log_event(
    p_event_type := 'settings.updated',
    p_subject_type := 'institution_settings',
    p_subject_id := NULL,
    p_institution_id := NEW.institution_id,
    p_payload := jsonb_build_object(
      'changed_fields', to_jsonb(v_changed_fields)
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'institution_id', NEW.institution_id
      )
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_institution_settings_audit_row ON public.institution_settings;
CREATE TRIGGER trg_institution_settings_audit_row
  AFTER UPDATE ON public.institution_settings
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_settings_audit();

CREATE OR REPLACE FUNCTION audit.log_institution_quotas_usage_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_changed_fields text[];
  v_event_type text := 'quota.updated';
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_changed_fields := ARRAY_REMOVE(ARRAY[
    CASE WHEN NEW.seats_used IS DISTINCT FROM OLD.seats_used THEN 'seats_used' END,
    CASE WHEN NEW.storage_used_bytes IS DISTINCT FROM OLD.storage_used_bytes THEN 'storage_used_bytes' END
  ], NULL);

  IF COALESCE(array_length(v_changed_fields, 1), 0) = 0 THEN
    RETURN NEW;
  END IF;

  IF NEW.seats_used >= 0 AND NEW.seats_used <> 0 AND NEW.seats_used % 10 = 0 THEN
    v_event_type := 'quota.warning';
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'institution_quota_usage',
    p_subject_id := NULL,
    p_institution_id := NEW.institution_id,
    p_payload := jsonb_build_object(
      'changed_fields', to_jsonb(v_changed_fields),
      'old_seats_used', OLD.seats_used,
      'new_seats_used', NEW.seats_used,
      'old_storage_used_bytes', OLD.storage_used_bytes,
      'new_storage_used_bytes', NEW.storage_used_bytes
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'institution_id', NEW.institution_id
      )
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_institution_quotas_usage_audit_row ON public.institution_quotas_usage;
CREATE TRIGGER trg_institution_quotas_usage_audit_row
  AFTER UPDATE ON public.institution_quotas_usage
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_quotas_usage_audit();

CREATE OR REPLACE FUNCTION audit.log_institution_invoice_records_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'invoice.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'invoice.deleted';
  ELSIF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_event_type := 'invoice.paid';
  ELSIF NEW.status = 'overdue' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_event_type := 'invoice.overdue';
  ELSIF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM NEW.status THEN
    v_event_type := 'invoice.cancelled';
  ELSIF NOT (
    NEW.status IS DISTINCT FROM OLD.status
    OR NEW.amount_cents IS DISTINCT FROM OLD.amount_cents
    OR NEW.currency IS DISTINCT FROM OLD.currency
    OR NEW.issued_at IS DISTINCT FROM OLD.issued_at
    OR NEW.due_at IS DISTINCT FROM OLD.due_at
    OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
    OR NEW.external_id IS DISTINCT FROM OLD.external_id
  ) THEN
    RETURN NEW;
  ELSE
    v_event_type := 'invoice.updated';
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'institution_invoice_record',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'invoice_reference', COALESCE(NEW.external_id, OLD.external_id),
      'amount_cents', CASE WHEN TG_OP = 'DELETE' THEN OLD.amount_cents ELSE NEW.amount_cents END,
      'currency', CASE WHEN TG_OP = 'DELETE' THEN OLD.currency ELSE NEW.currency END,
      'billing_status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE NEW.status END,
      'period_start', CASE WHEN TG_OP = 'DELETE' THEN OLD.issued_at ELSE NEW.issued_at END,
      'period_end', CASE WHEN TG_OP = 'DELETE' THEN OLD.due_at ELSE NEW.due_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'invoice_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_institution_invoice_records_audit_row ON public.institution_invoice_records;
CREATE TRIGGER trg_institution_invoice_records_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_invoice_records
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_invoice_records_audit();

CREATE OR REPLACE FUNCTION audit.log_data_subject_requests_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'dsr.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'dsr.deleted';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'completed' THEN
      v_event_type := 'dsr.completed';
    ELSE
      v_event_type := 'dsr.status_changed';
    END IF;
  ELSIF NOT (
    NEW.request_type IS DISTINCT FROM OLD.request_type
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.completed_at IS DISTINCT FROM OLD.completed_at
  ) THEN
    RETURN NEW;
  ELSE
    v_event_type := 'dsr.updated';
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'data_subject_request',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'request_type', CASE WHEN TG_OP = 'DELETE' THEN OLD.request_type ELSE NEW.request_type END,
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
      'new_status', CASE WHEN TG_OP = 'UPDATE' THEN NEW.status ELSE NULL END,
      'deadline_at', NULL,
      'handled_by_role', CASE WHEN (SELECT app.is_super_admin()) THEN 'super_admin' ELSE 'institution_admin' END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'dsr_id', COALESCE(NEW.id, OLD.id),
        'request_type', COALESCE(NEW.request_type, OLD.request_type)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_data_subject_requests_audit_row ON public.data_subject_requests;
CREATE TRIGGER trg_data_subject_requests_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION audit.log_data_subject_requests_audit();
