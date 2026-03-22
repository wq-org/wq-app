-- =============================================================================
-- PLATFORM GOVERNANCE — Super Admin plane (docs 01_Super_Admin, 14_Subscription)
--
-- Doc map:
--   01_Super_Admin.md  → audit.events, institutions governance columns, commercial
--                        catalog, global feature definitions, entitlement overrides,
--                        audit triggers for sensitive changes.
--   14_Subscription_and_Entitlements.md → plan_catalog, feature_definitions,
--                        plan_entitlements, institution_subscriptions, billing_status,
--                        institution_entitlement_overrides, billing_providers.
--   02_Institution.md  → consumers only; tenant tables + RLS in 20260321000002.
--
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
--   (app.auth_uid / app.is_super_admin and LMS super-admin RLS live there.)
-- =============================================================================

-- =============================================================================
-- 1. AUDIT SCHEMA — append-only event log
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  actor_user_id   uuid,
  event_type      text        NOT NULL,
  subject_type    text,
  subject_id      uuid,
  institution_id  uuid,
  payload         jsonb,
  metadata        jsonb
);

COMMENT ON TABLE  audit.events                    IS 'Append-only security and compliance event log.';
COMMENT ON COLUMN audit.events.event_type         IS 'Dot-namespaced action, e.g. entitlement_override.updated.';
COMMENT ON COLUMN audit.events.subject_type       IS 'Entity kind the event relates to, e.g. institution.';
COMMENT ON COLUMN audit.events.subject_id         IS 'Primary key of the affected entity.';
COMMENT ON COLUMN audit.events.institution_id     IS 'Tenant context (NULL for platform-level events).';
COMMENT ON COLUMN audit.events.payload            IS 'Structured before/after or detail data.';

CREATE INDEX IF NOT EXISTS idx_audit_events_institution ON audit.events (institution_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor       ON audit.events (actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_type        ON audit.events (event_type, occurred_at DESC);

ALTER TABLE audit.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_events_select ON audit.events;
CREATE POLICY audit_events_select ON audit.events
  FOR SELECT TO authenticated
  USING ((select app.is_super_admin()) is true);

REVOKE INSERT, UPDATE, DELETE ON audit.events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON audit.events FROM anon;

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

-- =============================================================================
-- 2. ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE institution_health_state AS ENUM ('healthy', 'warning', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE entitlement_value_type AS ENUM ('boolean', 'integer', 'bigint', 'text');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_status AS ENUM (
    'active', 'trialing', 'past_due', 'grace', 'suspended', 'expired', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- If billing_status existed from an older draft without suspended, add the value (portable).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'billing_status'
      AND e.enumlabel = 'suspended'
  ) THEN
    ALTER TYPE billing_status ADD VALUE 'suspended';
  END IF;
END $$;

-- =============================================================================
-- 3. EXTEND public.institutions — governance (01_Super_Admin.md)
-- =============================================================================
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS deleted_at                   timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at                 timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason            text,
  ADD COLUMN IF NOT EXISTS data_region                  text,
  ADD COLUMN IF NOT EXISTS email_domain_policy          jsonb,
  ADD COLUMN IF NOT EXISTS health_state                 institution_health_state DEFAULT 'healthy',
  ADD COLUMN IF NOT EXISTS default_retention_policy_code text;

COMMENT ON COLUMN public.institutions.deleted_at          IS 'Soft-delete marker; NULL = active.';
COMMENT ON COLUMN public.institutions.suspended_at        IS 'Operational suspension timestamp (tenant access). Distinct from subscription billing_status = suspended.';
COMMENT ON COLUMN public.institutions.suspension_reason   IS 'Reason for suspension (free text).';
COMMENT ON COLUMN public.institutions.health_state        IS 'Platform health signal: healthy (blue), warning (orange), critical (red).';
COMMENT ON COLUMN public.institutions.email_domain_policy IS 'Allowed email domains and SSO hints.';
COMMENT ON COLUMN public.institutions.data_region         IS 'Data residency region label.';

CREATE INDEX IF NOT EXISTS idx_institutions_health
  ON public.institutions (health_state)
  WHERE deleted_at IS NULL;

ALTER TABLE public.institutions FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. PLAN CATALOG — commercial plans (14_Subscription §8.1; matrix in plan_entitlements)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_catalog (
  id                        uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  code                      text    NOT NULL,
  name                      text    NOT NULL,
  description               text,
  seat_cap_default          integer,
  storage_bytes_cap_default bigint,
  metadata                  jsonb,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  deleted_at                timestamptz,
  CONSTRAINT plan_catalog_code_unique UNIQUE (code)
);

ALTER TABLE public.plan_catalog
  ADD COLUMN IF NOT EXISTS price_amount numeric(12, 2),
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS billing_interval text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON TABLE  public.plan_catalog IS 'Commercial subscription plans; default limits per feature live in plan_entitlements (not metadata).';
COMMENT ON COLUMN public.plan_catalog.code IS 'Machine-readable key, e.g. basic, plus, enterprise.';
COMMENT ON COLUMN public.plan_catalog.metadata IS 'Legacy/extension JSON; prefer plan_entitlements for the entitlement matrix.';
COMMENT ON COLUMN public.plan_catalog.price_amount IS 'List price in major currency units (e.g. EUR).';
COMMENT ON COLUMN public.plan_catalog.billing_interval IS 'e.g. monthly, annual, none (internal/trial).';
COMMENT ON COLUMN public.plan_catalog.is_active IS 'False hides plan from new assignments.';
COMMENT ON COLUMN public.plan_catalog.seat_cap_default IS 'Default seat limit for new subscriptions on this plan.';
COMMENT ON COLUMN public.plan_catalog.storage_bytes_cap_default IS 'Default storage cap in bytes.';
COMMENT ON TYPE billing_status IS
  'Subscription lifecycle. UK spelling cancelled; app may display US canceled.';

ALTER TABLE public.plan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_catalog FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_catalog_super_admin ON public.plan_catalog;
CREATE POLICY plan_catalog_super_admin ON public.plan_catalog
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP TRIGGER IF EXISTS plan_catalog_updated_at ON public.plan_catalog;
CREATE TRIGGER plan_catalog_updated_at
  BEFORE UPDATE ON public.plan_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 5. FEATURE DEFINITIONS — catalog (14_Subscription §8.2)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feature_definitions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text        NOT NULL,
  description     text,
  default_enabled boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT feature_definitions_key_unique UNIQUE (key)
);

ALTER TABLE public.feature_definitions
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS value_type entitlement_value_type NOT NULL DEFAULT 'boolean';

COMMENT ON TABLE  public.feature_definitions IS 'Feature catalog; plan defaults in plan_entitlements; per-tenant in institution_entitlement_overrides.';
COMMENT ON COLUMN public.feature_definitions.key IS 'Stable machine key, e.g. game_studio, max_teachers.';
COMMENT ON COLUMN public.feature_definitions.name IS 'Human-readable label.';
COMMENT ON COLUMN public.feature_definitions.category IS 'Grouping for admin UI, e.g. core, collaboration.';
COMMENT ON COLUMN public.feature_definitions.value_type IS 'Which value column is authoritative in plan_entitlements / overrides.';
COMMENT ON COLUMN public.feature_definitions.default_enabled IS 'When value_type = boolean, platform default before plan/overrides.';

ALTER TABLE public.feature_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_definitions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_defs_super_admin ON public.feature_definitions;
CREATE POLICY feature_defs_super_admin ON public.feature_definitions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS feature_defs_authenticated_read ON public.feature_definitions;
CREATE POLICY feature_defs_authenticated_read ON public.feature_definitions
  FOR SELECT TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS feature_defs_updated_at ON public.feature_definitions;
CREATE TRIGGER feature_defs_updated_at
  BEFORE UPDATE ON public.feature_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 6. PLAN ENTITLEMENTS — plan → feature default values (14_Subscription §8.3)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id        uuid        NOT NULL REFERENCES public.plan_catalog(id) ON DELETE CASCADE,
  feature_id     uuid        NOT NULL REFERENCES public.feature_definitions(id) ON DELETE CASCADE,
  boolean_value  boolean,
  integer_value  integer,
  bigint_value   bigint,
  text_value     text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plan_entitlements_plan_feature_unique UNIQUE (plan_id, feature_id)
);

COMMENT ON TABLE public.plan_entitlements IS 'Default entitlement values per commercial plan; effective resolution: plan → institution override (see doc 14 §7).';

CREATE INDEX IF NOT EXISTS idx_plan_entitlements_plan ON public.plan_entitlements (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_entitlements_feature ON public.plan_entitlements (feature_id);

ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_entitlements_super_admin ON public.plan_entitlements;
CREATE POLICY plan_entitlements_super_admin ON public.plan_entitlements
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP TRIGGER IF EXISTS plan_entitlements_updated_at ON public.plan_entitlements;
CREATE TRIGGER plan_entitlements_updated_at
  BEFORE UPDATE ON public.plan_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 7. INSTITUTION SUBSCRIPTIONS (14_Subscription §8.4, §9)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.institution_subscriptions (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id    uuid           NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  plan_id           uuid           NOT NULL REFERENCES public.plan_catalog(id) ON DELETE RESTRICT,
  effective_from    timestamptz    NOT NULL DEFAULT now(),
  effective_to      timestamptz,
  billing_status    billing_status NOT NULL DEFAULT 'active',
  renewal_at        timestamptz,
  grace_ends_at     timestamptz,
  seats_cap         integer,
  storage_bytes_cap bigint,
  created_at        timestamptz    NOT NULL DEFAULT now(),
  updated_at        timestamptz    NOT NULL DEFAULT now()
);

ALTER TABLE public.institution_subscriptions
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_end   timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS canceled_at          timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at        timestamptz;

COMMENT ON TABLE  public.institution_subscriptions IS 'Subscription state per institution; caps may override plan_entitlements.';
COMMENT ON COLUMN public.institution_subscriptions.grace_ends_at IS 'End of grace window (maps doc grace_until).';
COMMENT ON COLUMN public.institution_subscriptions.trial_ends_at IS 'When trialing status should be re-evaluated.';
COMMENT ON COLUMN public.institution_subscriptions.cancel_at_period_end IS 'Stripe-style cancel at period end.';

DROP INDEX IF EXISTS idx_inst_subs_status;
CREATE INDEX IF NOT EXISTS idx_inst_subs_institution ON public.institution_subscriptions (institution_id);
CREATE INDEX IF NOT EXISTS idx_inst_subs_status ON public.institution_subscriptions (billing_status)
  WHERE billing_status NOT IN ('expired', 'cancelled', 'suspended');

ALTER TABLE public.institution_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_subscriptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inst_subs_super_admin ON public.institution_subscriptions;
CREATE POLICY inst_subs_super_admin ON public.institution_subscriptions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Institution-admin SELECT added in 20260321000002_institution_admin.sql

DROP TRIGGER IF EXISTS inst_subs_updated_at ON public.institution_subscriptions;
CREATE TRIGGER inst_subs_updated_at
  BEFORE UPDATE ON public.institution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 8. INSTITUTION ENTITLEMENT OVERRIDES — typed overrides (14_Subscription §8.5)
-- =============================================================================
DROP TABLE IF EXISTS public.institution_feature_overrides CASCADE;

CREATE TABLE public.institution_entitlement_overrides (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  feature_id     uuid        NOT NULL REFERENCES public.feature_definitions(id) ON DELETE CASCADE,
  boolean_value  boolean,
  integer_value  integer,
  bigint_value   bigint,
  text_value     text,
  reason         text,
  starts_at      timestamptz NOT NULL DEFAULT now(),
  ends_at        timestamptz,
  created_by     uuid        REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inst_entitlement_override_unique UNIQUE (institution_id, feature_id)
);

COMMENT ON TABLE public.institution_entitlement_overrides IS 'Per-institution override of plan_entitlements / boolean defaults; MVP one row per (institution, feature).';
COMMENT ON COLUMN public.institution_entitlement_overrides.ends_at IS 'NULL means no end; time-bound promos use starts_at/ends_at.';

CREATE INDEX idx_inst_entitlement_overrides_institution
  ON public.institution_entitlement_overrides (institution_id);

ALTER TABLE public.institution_entitlement_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_entitlement_overrides FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inst_entitlement_overrides_super_admin ON public.institution_entitlement_overrides;
CREATE POLICY inst_entitlement_overrides_super_admin ON public.institution_entitlement_overrides
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Member read policy in file 2

DROP TRIGGER IF EXISTS inst_entitlement_overrides_updated_at ON public.institution_entitlement_overrides;
CREATE TRIGGER inst_entitlement_overrides_updated_at
  BEFORE UPDATE ON public.institution_entitlement_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 9. BILLING PROVIDERS — external PSP linkage (14_Subscription §8.6)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.billing_providers (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id           uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  provider                 text        NOT NULL,
  external_customer_id     text,
  external_subscription_id text,
  external_price_id        text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT billing_providers_inst_provider_unique UNIQUE (institution_id, provider)
);

COMMENT ON TABLE public.billing_providers IS 'Stripe or other PSP external IDs per institution.';

CREATE INDEX IF NOT EXISTS idx_billing_providers_institution ON public.billing_providers (institution_id);

ALTER TABLE public.billing_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_providers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS billing_providers_super_admin ON public.billing_providers;
CREATE POLICY billing_providers_super_admin ON public.billing_providers
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP TRIGGER IF EXISTS billing_providers_updated_at ON public.billing_providers;
CREATE TRIGGER billing_providers_updated_at
  BEFORE UPDATE ON public.billing_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 10. AUDIT TRIGGERS — plan, entitlements, subscription, billing (14 §14, 01)
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
CREATE TRIGGER trg_audit_plan_catalog
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
CREATE TRIGGER trg_audit_plan_entitlements
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
CREATE TRIGGER trg_audit_institution_subscriptions
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
CREATE TRIGGER trg_audit_billing_providers
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
CREATE TRIGGER trg_audit_entitlement_override
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_entitlement_overrides
  FOR EACH ROW EXECUTE FUNCTION audit.log_entitlement_override_audit();

-- =============================================================================
-- 11. SEED — default trial plan + feature catalog keys (14 §5, idempotent)
-- =============================================================================
INSERT INTO public.plan_catalog (code, name, description, billing_interval, is_active, price_amount)
VALUES (
  'trial',
  'Trial',
  'Default trial for new institutions created via create_institution_with_initial_admin.',
  'none',
  true,
  0
)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.feature_definitions (key, name, category, value_type, default_enabled) VALUES
  ('institution', 'Institution', 'core', 'boolean', true),
  ('student', 'Student', 'core', 'boolean', true),
  ('teacher', 'Teacher', 'core', 'boolean', true),
  ('classroom', 'Classroom', 'core', 'boolean', true),
  ('reward_system', 'Reward System', 'engagement', 'boolean', false),
  ('course', 'Course', 'learning', 'boolean', true),
  ('game_studio', 'Game Studio', 'learning', 'boolean', false),
  ('task', 'Task', 'learning', 'boolean', true),
  ('calendar', 'Calendar', 'scheduling', 'boolean', false),
  ('cloud_storage', 'Cloud storage', 'infrastructure', 'boolean', true),
  ('note', 'Note', 'collaboration', 'boolean', true),
  ('chat', 'Chat', 'collaboration', 'boolean', false),
  ('notification', 'Notification', 'collaboration', 'boolean', true),
  ('max_teachers', 'Max teachers', 'limits', 'integer', false),
  ('max_students', 'Max students', 'limits', 'integer', false),
  ('max_classrooms', 'Max classrooms', 'limits', 'integer', false),
  ('storage_quota_mb', 'Storage quota (MB)', 'limits', 'integer', false)
ON CONFLICT (key) DO NOTHING;
