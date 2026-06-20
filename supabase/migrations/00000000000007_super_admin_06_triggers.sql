-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-ATTENDANCE+WQ-REWARDS | strip attendance + point_ledger/classroom_reward_settings audit trigger functions; KEEP other audit triggers | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- SUPER ADMIN — Triggers
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260000000001_baseline_schema, 20260000000002_super_admin
--
-- Audit trigger functions in this file emit events into `audit.events` via
-- `audit.log_event(...)`. They follow the binding contract in
-- `docs/architecture/principle_dsgvo_audit_datendefinition.md`:
--   * canonical envelope (event_type, subject_type/id, institution_id, actor)
--   * `metadata.visibility_level` ∈ {institution_admin | super_admin | security_only}
--   * `metadata.context` carries only allowlisted IDs (no free-text, no tokens,
--     no JSONB row dumps, no Art. 9 health data)
--   * `metadata.changed_fields` lists which tracked columns changed on UPDATE
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
-- AUDIT TRIGGERS — plan catalog, entitlements, subscriptions, billing
-- visibility: plan_catalog & plan_entitlements are global (super_admin);
--             subscription / billing / override events are institution-scoped.
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
      'is_active', CASE WHEN TG_OP = 'DELETE' THEN OLD.is_active ELSE NEW.is_active END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'super_admin',
      'context', jsonb_build_object(
        'plan_id', COALESCE(NEW.id, OLD.id)
      ),
      'changed_fields', CASE
        WHEN TG_OP <> 'UPDATE' THEN '[]'::jsonb
        ELSE to_jsonb(
          ARRAY_REMOVE(ARRAY[
            CASE WHEN NEW.code IS DISTINCT FROM OLD.code THEN 'code' END,
            CASE WHEN NEW.name IS DISTINCT FROM OLD.name THEN 'name' END,
            CASE WHEN NEW.is_active IS DISTINCT FROM OLD.is_active THEN 'is_active' END
          ], NULL)
        )
      END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_plan_catalog_audit() IS
  'Audit trigger for plan catalog lifecycle changes. Global scope, visibility super_admin.';

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
    p_subject_type := 'plan_entitlement',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_payload := jsonb_build_object(
      'plan_id', COALESCE(NEW.plan_id, OLD.plan_id),
      'feature_id', COALESCE(NEW.feature_id, OLD.feature_id)
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'super_admin',
      'context', jsonb_build_object(
        'entitlement_id', COALESCE(NEW.id, OLD.id),
        'plan_id', COALESCE(NEW.plan_id, OLD.plan_id),
        'feature_id', COALESCE(NEW.feature_id, OLD.feature_id)
      )
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_plan_entitlements_audit() IS
  'Audit trigger for plan/feature entitlement mappings. Global scope, visibility super_admin.';

DROP TRIGGER IF EXISTS trg_audit_plan_entitlements ON public.plan_entitlements;
DROP TRIGGER IF EXISTS trg_plan_entitlements_audit_row ON public.plan_entitlements;
CREATE TRIGGER trg_plan_entitlements_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION audit.log_plan_entitlements_audit();

-- institution_subscriptions audit trigger: owned by custom_pricing_06_triggers (file 133).
-- That file creates audit.log_institution_subscriptions_audit() + trg_institution_subscriptions_audit_row
-- with status-transition-aware events (subscription.assigned/activated/cancelled/ended).

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
    p_subject_type := 'billing_provider',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'provider', COALESCE(NEW.provider, OLD.provider)
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'provider_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_billing_providers_audit() IS
  'Audit trigger for billing provider configuration changes. No credential material is logged.';

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
  -- Note: `reason` column is intentionally NOT logged (free-text, dsgvo §2.3).
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'entitlement_override.created'
      WHEN 'DELETE' THEN 'entitlement_override.deleted'
      ELSE 'entitlement_override.updated'
    END,
    p_subject_type := 'institution_entitlement_override',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'feature_id', COALESCE(NEW.feature_id, OLD.feature_id),
      'boolean_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.boolean_value ELSE NEW.boolean_value END,
      'integer_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.integer_value ELSE NEW.integer_value END,
      'bigint_value', CASE WHEN TG_OP = 'DELETE' THEN OLD.bigint_value ELSE NEW.bigint_value END,
      'starts_at', COALESCE(NEW.starts_at, OLD.starts_at),
      'ends_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ends_at ELSE NEW.ends_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'override_id', COALESCE(NEW.id, OLD.id),
        'feature_id', COALESCE(NEW.feature_id, OLD.feature_id)
      ),
      'changed_fields', CASE
        WHEN TG_OP <> 'UPDATE' THEN '[]'::jsonb
        ELSE to_jsonb(
          ARRAY_REMOVE(ARRAY[
            CASE WHEN NEW.feature_id IS DISTINCT FROM OLD.feature_id THEN 'feature_id' END,
            CASE WHEN NEW.boolean_value IS DISTINCT FROM OLD.boolean_value THEN 'boolean_value' END,
            CASE WHEN NEW.integer_value IS DISTINCT FROM OLD.integer_value THEN 'integer_value' END,
            CASE WHEN NEW.bigint_value IS DISTINCT FROM OLD.bigint_value THEN 'bigint_value' END,
            CASE WHEN NEW.text_value IS DISTINCT FROM OLD.text_value THEN 'text_value' END,
            CASE WHEN NEW.starts_at IS DISTINCT FROM OLD.starts_at THEN 'starts_at' END,
            CASE WHEN NEW.ends_at IS DISTINCT FROM OLD.ends_at THEN 'ends_at' END
          ], NULL)
        )
      END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_entitlement_override_audit() IS
  'Audit trigger for per-institution feature overrides. `reason` free-text and `text_value` are not logged.';

DROP TRIGGER IF EXISTS trg_audit_entitlement_override ON public.institution_entitlement_overrides;
DROP TRIGGER IF EXISTS trg_institution_entitlement_overrides_audit_row ON public.institution_entitlement_overrides;
CREATE TRIGGER trg_institution_entitlement_overrides_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_entitlement_overrides
  FOR EACH ROW EXECUTE FUNCTION audit.log_entitlement_override_audit();

-- =============================================================================
-- AUDIT TRIGGER FUNCTIONS — game runtime
-- Note: trigger functions are defined here, but triggers are created in the
-- domain migrations that create the tables (game_runtime).
-- =============================================================================

CREATE OR REPLACE FUNCTION audit.log_game_runs_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := CASE TG_OP
      WHEN 'INSERT' THEN 'game_run.created'
      WHEN 'DELETE' THEN 'game_run.deleted'
      ELSE 'game_run.updated'
    END,
    p_subject_type := 'game_run',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'mode', CASE WHEN TG_OP = 'DELETE' THEN OLD.mode::text ELSE NEW.mode::text END,
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END,
      'started_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.started_at ELSE NEW.started_at END,
      'ended_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ended_at ELSE NEW.ended_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'run_id', COALESCE(NEW.id, OLD.id),
        'game_id', COALESCE(NEW.game_id, OLD.game_id),
        'classroom_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.classroom_id ELSE NEW.classroom_id END,
        'started_by', COALESCE(NEW.started_by, OLD.started_by)
      )
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit.log_game_runs_audit() IS
  'Audit trigger for game run lifecycle changes (solo, versus, classroom).';

-- notifications audit lives in the notifications domain migration
-- (audit.log_notification_events_audit in 20260000000071_notifications_04_functions_rpcs.sql).
