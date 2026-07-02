-- =============================================================================
-- CUSTOM PRICING — Triggers
--
-- A. Immutability: published plan_versions are frozen (only status→archived allowed).
--    plan_version_entitlements are insert-only once the parent version is published.
-- B. Audit: plan_versions and institution_subscriptions lifecycle events.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- A1. Immutability guard on plan_versions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.plan_versions_immutability_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'published' THEN
      RAISE EXCEPTION 'plan_versions: published version % cannot be deleted', OLD.id;
    END IF;
    RETURN OLD;
  END IF;

  -- UPDATE: only status→archived transition allowed on a published row
  IF OLD.status = 'published' THEN
    IF NEW.status = 'archived' THEN
      -- allow only: status, archived_at
      IF NEW.plan_id       IS DISTINCT FROM OLD.plan_id       OR
         NEW.version_no    IS DISTINCT FROM OLD.version_no    OR
         NEW.name          IS DISTINCT FROM OLD.name          OR
         NEW.price_amount  IS DISTINCT FROM OLD.price_amount  OR
         NEW.currency      IS DISTINCT FROM OLD.currency      OR
         NEW.billing_interval IS DISTINCT FROM OLD.billing_interval OR
         NEW.change_note   IS DISTINCT FROM OLD.change_note   OR
         NEW.published_at  IS DISTINCT FROM OLD.published_at THEN
        RAISE EXCEPTION 'plan_versions: only status→archived is permitted on a published version';
      END IF;
    ELSE
      RAISE EXCEPTION 'plan_versions: published version % is immutable (attempted status change: %→%)',
        OLD.id, OLD.status, NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_plan_versions_immutability ON public.plan_versions;
CREATE TRIGGER trg_plan_versions_immutability
  BEFORE UPDATE OR DELETE ON public.plan_versions
  FOR EACH ROW EXECUTE FUNCTION app.plan_versions_immutability_guard();

-- ---------------------------------------------------------------------------
-- A2. Immutability guard on plan_version_entitlements (insert-only after publish)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.plan_version_entitlements_immutability_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status public.plan_version_status;
BEGIN
  SELECT status INTO v_status
  FROM public.plan_versions
  WHERE id = COALESCE(OLD.plan_version_id, NEW.plan_version_id);

  IF v_status <> 'draft' THEN
    RAISE EXCEPTION
      'plan_version_entitlements: cannot % rows for a % version',
      TG_OP, v_status;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pve_immutability ON public.plan_version_entitlements;
DROP TRIGGER IF EXISTS trg_plan_version_entitlements_immutability ON public.plan_version_entitlements;
CREATE TRIGGER trg_plan_version_entitlements_immutability
  BEFORE UPDATE OR DELETE ON public.plan_version_entitlements
  FOR EACH ROW EXECUTE FUNCTION app.plan_version_entitlements_immutability_guard();

-- ---------------------------------------------------------------------------
-- B1. Audit trigger on plan_versions
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.log_plan_versions_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := CASE WHEN NEW.status = 'published' THEN 'plan_version.published' ELSE 'plan_version.created' END;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'archived' AND OLD.status = 'published' THEN
    v_event_type := 'plan_version.archived';
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM audit.log_event(
    p_event_type   := v_event_type,
    p_subject_type := 'plan_version',
    p_subject_id   := COALESCE(NEW.id, OLD.id),
    p_payload      := jsonb_build_object(
      'plan_id',    COALESCE(NEW.plan_id, OLD.plan_id),
      'version_no', COALESCE(NEW.version_no, OLD.version_no),
      'status',     COALESCE(NEW.status::text, OLD.status::text)
    ),
    p_metadata     := jsonb_build_object(
      'visibility_level', 'super_admin'
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_plan_versions_audit_row ON public.plan_versions;
CREATE TRIGGER trg_plan_versions_audit_row
  AFTER INSERT OR UPDATE ON public.plan_versions
  FOR EACH ROW EXECUTE FUNCTION audit.log_plan_versions_audit();

-- ---------------------------------------------------------------------------
-- B2. Audit trigger on institution_subscriptions (status transitions)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.log_institution_subscriptions_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'subscription.assigned';
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.billing_status IS DISTINCT FROM OLD.billing_status THEN
      v_event_type := CASE NEW.billing_status::text
        WHEN 'active'    THEN 'subscription.activated'
        WHEN 'cancelled' THEN 'subscription.cancelled'
        WHEN 'suspended' THEN 'subscription.suspended'
        WHEN 'expired'   THEN 'subscription.expired'
        ELSE                  'subscription.status_changed'
      END;
    ELSIF NEW.effective_to IS NOT NULL AND OLD.effective_to IS NULL THEN
      v_event_type := 'subscription.ended';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN OLD;
  END IF;

  PERFORM audit.log_event(
    p_event_type     := v_event_type,
    p_subject_type   := 'institution_subscription',
    p_subject_id     := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload        := jsonb_build_object(
      'billing_status',  COALESCE(NEW.billing_status::text, OLD.billing_status::text),
      'plan_version_id', COALESCE(NEW.plan_version_id, OLD.plan_version_id)
    ),
    p_metadata       := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'plan_id', COALESCE(NEW.plan_id, OLD.plan_id)
      )
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_institution_subscriptions_audit_row ON public.institution_subscriptions;
CREATE TRIGGER trg_institution_subscriptions_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_subscriptions_audit();
