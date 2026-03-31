-- =============================================================================
-- SUPER ADMIN — Tables and column additions
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid,
  event_type text NOT NULL,
  subject_type text,
  subject_id uuid,
  institution_id uuid,
  payload jsonb,
  metadata jsonb
);

COMMENT ON TABLE audit.events IS 'Append-only security and compliance event log.';
COMMENT ON COLUMN audit.events.event_type IS 'Dot-namespaced action, e.g. entitlement_override.updated.';
COMMENT ON COLUMN audit.events.subject_type IS 'Entity kind the event relates to, e.g. institution.';
COMMENT ON COLUMN audit.events.subject_id IS 'Primary key of the affected entity.';
COMMENT ON COLUMN audit.events.institution_id IS 'Tenant context (NULL for platform-level events).';
COMMENT ON COLUMN audit.events.payload IS 'Structured before/after or detail data.';

-- =============================================================================
-- EXTEND public.institutions — governance (01_Super_Admin.md)
-- =============================================================================
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS data_region text,
  ADD COLUMN IF NOT EXISTS email_domain_policy jsonb,
  ADD COLUMN IF NOT EXISTS health_state institution_health_state DEFAULT 'healthy',
  ADD COLUMN IF NOT EXISTS default_retention_policy_code text;

COMMENT ON COLUMN public.institutions.deleted_at IS 'Soft-delete marker; NULL = active.';
COMMENT ON COLUMN public.institutions.suspended_at IS 'Operational suspension timestamp (tenant access). Distinct from subscription billing_status = suspended.';
COMMENT ON COLUMN public.institutions.suspension_reason IS 'Reason for suspension (free text).';
COMMENT ON COLUMN public.institutions.health_state IS 'Platform health signal: healthy (blue), warning (orange), critical (red).';
COMMENT ON COLUMN public.institutions.email_domain_policy IS 'Allowed email domains and SSO hints.';
COMMENT ON COLUMN public.institutions.data_region IS 'Data residency region label.';

-- =============================================================================
-- PLAN CATALOG — commercial plans (14_Subscription §8.1)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text,
  seat_cap_default integer,
  storage_bytes_cap_default bigint,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT uq_plan_catalog_code UNIQUE (code)
);

ALTER TABLE public.plan_catalog
  ADD COLUMN IF NOT EXISTS price_amount numeric(12, 2),
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS billing_interval text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON TABLE public.plan_catalog IS 'Commercial subscription plans; default limits per feature live in plan_entitlements (not metadata).';
COMMENT ON COLUMN public.plan_catalog.code IS 'Machine-readable key, e.g. basic, plus, enterprise.';
COMMENT ON COLUMN public.plan_catalog.metadata IS 'Legacy/extension JSON; prefer plan_entitlements for the entitlement matrix.';
COMMENT ON COLUMN public.plan_catalog.price_amount IS 'List price in major currency units (e.g. EUR).';
COMMENT ON COLUMN public.plan_catalog.billing_interval IS 'e.g. monthly, annual, none (internal/trial).';
COMMENT ON COLUMN public.plan_catalog.is_active IS 'False hides plan from new assignments.';
COMMENT ON COLUMN public.plan_catalog.seat_cap_default IS 'Default seat limit for new subscriptions on this plan.';
COMMENT ON COLUMN public.plan_catalog.storage_bytes_cap_default IS 'Default storage cap in bytes.';

-- =============================================================================
-- FEATURE DEFINITIONS — catalog (14_Subscription §8.2)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feature_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  description text,
  default_enabled boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_feature_definitions_key UNIQUE (key)
);

ALTER TABLE public.feature_definitions
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS value_type entitlement_value_type NOT NULL DEFAULT 'boolean';

COMMENT ON TABLE public.feature_definitions IS 'Feature catalog; plan defaults in plan_entitlements; per-tenant in institution_entitlement_overrides.';
COMMENT ON COLUMN public.feature_definitions.key IS 'Stable machine key, e.g. game_studio, max_teachers.';
COMMENT ON COLUMN public.feature_definitions.name IS 'Human-readable label.';
COMMENT ON COLUMN public.feature_definitions.category IS 'Grouping for admin UI, e.g. core, collaboration.';
COMMENT ON COLUMN public.feature_definitions.value_type IS 'Which value column is authoritative in plan_entitlements / overrides.';
COMMENT ON COLUMN public.feature_definitions.default_enabled IS 'When value_type = boolean, platform default before plan/overrides.';

-- =============================================================================
-- PLAN ENTITLEMENTS — plan → feature default values (14_Subscription §8.3)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.plan_catalog (id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.feature_definitions (id) ON DELETE CASCADE,
  boolean_value boolean,
  integer_value integer,
  bigint_value bigint,
  text_value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_plan_entitlements_plan_id_feature_id UNIQUE (plan_id, feature_id)
);

COMMENT ON TABLE public.plan_entitlements IS 'Default entitlement values per commercial plan; effective resolution: plan → institution override (see doc 14 §7).';

-- =============================================================================
-- INSTITUTION SUBSCRIPTIONS (14_Subscription §8.4, §9)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.institution_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plan_catalog (id) ON DELETE RESTRICT,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  billing_status billing_status NOT NULL DEFAULT 'active',
  renewal_at timestamptz,
  grace_ends_at timestamptz,
  seats_cap integer,
  storage_bytes_cap bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.institution_subscriptions
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS canceled_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

COMMENT ON TABLE public.institution_subscriptions IS 'Subscription state per institution; caps may override plan_entitlements.';
COMMENT ON COLUMN public.institution_subscriptions.grace_ends_at IS 'End of grace window (maps doc grace_until).';
COMMENT ON COLUMN public.institution_subscriptions.trial_ends_at IS 'When trialing status should be re-evaluated.';
COMMENT ON COLUMN public.institution_subscriptions.cancel_at_period_end IS 'Stripe-style cancel at period end.';

-- =============================================================================
-- INSTITUTION ENTITLEMENT OVERRIDES — typed overrides (14_Subscription §8.5)
-- =============================================================================
DROP TABLE IF EXISTS public.institution_feature_overrides CASCADE;

CREATE TABLE public.institution_entitlement_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES public.feature_definitions (id) ON DELETE CASCADE,
  boolean_value boolean,
  integer_value integer,
  bigint_value bigint,
  text_value text,
  reason text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_institution_entitlement_overrides_institution_id_feature_id UNIQUE (institution_id, feature_id)
);

COMMENT ON TABLE public.institution_entitlement_overrides IS 'Per-institution override of plan_entitlements / boolean defaults; MVP one row per (institution, feature).';
COMMENT ON COLUMN public.institution_entitlement_overrides.ends_at IS 'NULL means no end; time-bound promos use starts_at/ends_at.';

-- =============================================================================
-- BILLING PROVIDERS — external PSP linkage (14_Subscription §8.6)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.billing_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_customer_id text,
  external_subscription_id text,
  external_price_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_billing_providers_institution_id_provider UNIQUE (institution_id, provider)
);

COMMENT ON TABLE public.billing_providers IS 'Stripe or other PSP external IDs per institution.';
