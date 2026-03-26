-- =============================================================================
-- SUPER ADMIN — Triggers
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

DROP TRIGGER IF EXISTS plan_catalog_updated_at ON public.plan_catalog;
DROP TRIGGER IF EXISTS trg_plan_catalog_set_updated_at ON public.plan_catalog;
CREATE TRIGGER trg_plan_catalog_set_updated_at
  BEFORE UPDATE ON public.plan_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS feature_defs_updated_at ON public.feature_definitions;
DROP TRIGGER IF EXISTS trg_feature_definitions_set_updated_at ON public.feature_definitions;
CREATE TRIGGER trg_feature_definitions_set_updated_at
  BEFORE UPDATE ON public.feature_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS plan_entitlements_updated_at ON public.plan_entitlements;
DROP TRIGGER IF EXISTS trg_plan_entitlements_set_updated_at ON public.plan_entitlements;
CREATE TRIGGER trg_plan_entitlements_set_updated_at
  BEFORE UPDATE ON public.plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS inst_subs_updated_at ON public.institution_subscriptions;
DROP TRIGGER IF EXISTS trg_institution_subscriptions_set_updated_at ON public.institution_subscriptions;
CREATE TRIGGER trg_institution_subscriptions_set_updated_at
  BEFORE UPDATE ON public.institution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS inst_entitlement_overrides_updated_at ON public.institution_entitlement_overrides;
DROP TRIGGER IF EXISTS trg_institution_entitlement_overrides_set_updated_at ON public.institution_entitlement_overrides;
CREATE TRIGGER trg_institution_entitlement_overrides_set_updated_at
  BEFORE UPDATE ON public.institution_entitlement_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS billing_providers_updated_at ON public.billing_providers;
DROP TRIGGER IF EXISTS trg_billing_providers_set_updated_at ON public.billing_providers;
CREATE TRIGGER trg_billing_providers_set_updated_at
  BEFORE UPDATE ON public.billing_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- AUDIT TRIGGERS — plan, entitlements, subscription, billing (14 §14, 01)
-- =============================================================================
CREATE OR REPLACE FUNCTION audit.log_plan_catalog_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'plan_catalog.created'
      WHEN 'DELETE' THEN 'plan_catalog.deleted'
      ELSE 'plan_catalog.updated'
    END,
    p_subject_type := 'plan_catalog',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_payload := jsonb_build_object(
      'code', COALESCE(NEW.code, OLD.code),
      'name', COALESCE(NEW.name, OLD.name),
      'is_active', CASE WHEN TG_OP = 'DELETE' THEN OLD.is_active ELSE NEW.is_active END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_plan_catalog ON public.plan_catalog;
DROP TRIGGER IF EXISTS trg_plan_catalog_audit_row ON public.plan_catalog;
CREATE TRIGGER trg_plan_catalog_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.plan_catalog
  FOR EACH ROW EXECUTE FUNCTION audit.log_plan_catalog_audit();

CREATE OR REPLACE FUNCTION audit.log_plan_entitlements_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'plan_entitlement.created'
      WHEN 'DELETE' THEN 'plan_entitlement.deleted'
      ELSE 'plan_entitlement.updated'
    END,
    p_subject_type := 'plan_entitlements',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_payload := jsonb_build_object(
      'plan_id', COALESCE(NEW.plan_id, OLD.plan_id),
      'feature_id', COALESCE(NEW.feature_id, OLD.feature_id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_plan_entitlements ON public.plan_entitlements;
DROP TRIGGER IF EXISTS trg_plan_entitlements_audit_row ON public.plan_entitlements;
CREATE TRIGGER trg_plan_entitlements_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION audit.log_plan_entitlements_audit();

CREATE OR REPLACE FUNCTION audit.log_institution_subscriptions_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'subscription.created'
      WHEN 'DELETE' THEN 'subscription.deleted'
      ELSE 'subscription.updated'
    END,
    p_subject_type := 'institution_subscriptions',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'billing_status', CASE WHEN TG_OP = 'DELETE' THEN OLD.billing_status::text ELSE NEW.billing_status::text END,
      'previous_billing_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.billing_status::text ELSE NULL END,
      'plan_id', COALESCE(NEW.plan_id, OLD.plan_id)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_institution_subscriptions ON public.institution_subscriptions;
DROP TRIGGER IF EXISTS trg_institution_subscriptions_audit_row ON public.institution_subscriptions;
CREATE TRIGGER trg_institution_subscriptions_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit.log_institution_subscriptions_audit();

CREATE OR REPLACE FUNCTION audit.log_billing_providers_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'billing_provider.created'
      WHEN 'DELETE' THEN 'billing_provider.deleted'
      ELSE 'billing_provider.updated'
    END,
    p_subject_type := 'billing_providers',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'provider', COALESCE(NEW.provider, OLD.provider)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP FUNCTION IF EXISTS audit.log_feature_override_change();

DROP TRIGGER IF EXISTS trg_audit_billing_providers ON public.billing_providers;
DROP TRIGGER IF EXISTS trg_billing_providers_audit_row ON public.billing_providers;
CREATE TRIGGER trg_billing_providers_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.billing_providers
  FOR EACH ROW EXECUTE FUNCTION audit.log_billing_providers_audit();

CREATE OR REPLACE FUNCTION audit.log_entitlement_override_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'entitlement_override.created'
      WHEN 'DELETE' THEN 'entitlement_override.deleted'
      ELSE 'entitlement_override.updated'
    END,
    p_subject_type := 'institution_entitlement_overrides',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'feature_id', COALESCE(NEW.feature_id, OLD.feature_id),
      'boolean_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.boolean_value ELSE NEW.boolean_value END,
      'integer_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.integer_value ELSE NEW.integer_value END,
      'bigint_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.bigint_value ELSE NEW.bigint_value END,
      'text_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.text_value ELSE NEW.text_value END,
      'reason', CASE WHEN TG_OP = 'DELETE' THEN OLD.reason ELSE NEW.reason END,
      'starts_at', COALESCE(NEW.starts_at, OLD.starts_at),
      'ends_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ends_at ELSE NEW.ends_at END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_entitlement_override ON public.institution_entitlement_overrides;
DROP TRIGGER IF EXISTS trg_institution_entitlement_overrides_audit_row ON public.institution_entitlement_overrides;
CREATE TRIGGER trg_institution_entitlement_overrides_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_entitlement_overrides
  FOR EACH ROW EXECUTE FUNCTION audit.log_entitlement_override_audit();
