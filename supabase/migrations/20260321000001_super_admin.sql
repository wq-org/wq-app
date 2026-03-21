-- =============================================================================
-- SUPER ADMIN — Platform governance plane
-- Audit log, plan catalog, feature flags, institution governance extensions,
-- and subscription entitlements.
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
--   (app.auth_uid / app.is_super_admin and LMS super-admin RLS live there.)
-- =============================================================================

-- =============================================================================
-- 1. AUDIT SCHEMA — append-only event log
--    Direct DML revoked from API roles; inserts via audit.log_event() only.
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.events (
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
COMMENT ON COLUMN audit.events.event_type         IS 'Dot-namespaced action, e.g. feature_override.updated.';
COMMENT ON COLUMN audit.events.subject_type       IS 'Entity kind the event relates to, e.g. institution.';
COMMENT ON COLUMN audit.events.subject_id         IS 'Primary key of the affected entity.';
COMMENT ON COLUMN audit.events.institution_id     IS 'Tenant context (NULL for platform-level events).';
COMMENT ON COLUMN audit.events.payload            IS 'Structured before/after or detail data.';

CREATE INDEX idx_audit_events_institution ON audit.events (institution_id, occurred_at DESC);
CREATE INDEX idx_audit_events_actor       ON audit.events (actor_user_id, occurred_at DESC);
CREATE INDEX idx_audit_events_type        ON audit.events (event_type, occurred_at DESC);

ALTER TABLE audit.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.events FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_events_select ON audit.events
  FOR SELECT TO authenticated
  USING ((select app.is_super_admin()) is true);

REVOKE INSERT, UPDATE, DELETE ON audit.events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON audit.events FROM anon;

-- Controlled insert helper (SECURITY DEFINER — can write despite revoked grants)
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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_status AS ENUM (
    'active', 'trialing', 'past_due', 'grace', 'expired', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 3. EXTEND public.institutions — governance columns from 01_Super_Admin.md
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
COMMENT ON COLUMN public.institutions.suspended_at        IS 'Timestamp when the tenant was suspended.';
COMMENT ON COLUMN public.institutions.suspension_reason   IS 'Reason for suspension (free text).';
COMMENT ON COLUMN public.institutions.health_state        IS 'Platform health signal: healthy (blue), warning (orange), critical (red).';
COMMENT ON COLUMN public.institutions.email_domain_policy IS 'Allowed email domains and SSO hints.';
COMMENT ON COLUMN public.institutions.data_region         IS 'Data residency region label.';

CREATE INDEX IF NOT EXISTS idx_institutions_health
  ON public.institutions (health_state)
  WHERE deleted_at IS NULL;

-- Baseline only ENABLE'd RLS; add FORCE so table owner also obeys policies.
ALTER TABLE public.institutions FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. PLAN CATALOG — subscription templates managed by super admin
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.plan_catalog (
  id                        uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  code                      text    NOT NULL,
  name                      text    NOT NULL,
  seat_cap_default          integer,
  storage_bytes_cap_default bigint,
  metadata                  jsonb,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  deleted_at                timestamptz,
  CONSTRAINT plan_catalog_code_unique UNIQUE (code)
);

COMMENT ON TABLE  public.plan_catalog                           IS 'Available subscription plans (e.g. EDU Basic, EDU Plus).';
COMMENT ON COLUMN public.plan_catalog.code                      IS 'Machine-readable plan key, e.g. edu_basic.';
COMMENT ON COLUMN public.plan_catalog.seat_cap_default          IS 'Default seat limit for new subscriptions on this plan.';
COMMENT ON COLUMN public.plan_catalog.storage_bytes_cap_default IS 'Default storage cap in bytes.';

ALTER TABLE public.plan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_catalog FORCE ROW LEVEL SECURITY;

CREATE POLICY plan_catalog_super_admin ON public.plan_catalog
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP TRIGGER IF EXISTS plan_catalog_updated_at ON public.plan_catalog;
CREATE TRIGGER plan_catalog_updated_at
  BEFORE UPDATE ON public.plan_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 5. INSTITUTION SUBSCRIPTIONS — links institution to plan + entitlements
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

COMMENT ON TABLE  public.institution_subscriptions                   IS 'Active plan assignment and entitlement caps per institution.';
COMMENT ON COLUMN public.institution_subscriptions.institution_id    IS 'Tenant boundary (FK to institutions).';
COMMENT ON COLUMN public.institution_subscriptions.seats_cap         IS 'Effective seat cap; overrides plan default when set.';
COMMENT ON COLUMN public.institution_subscriptions.storage_bytes_cap IS 'Effective storage cap; overrides plan default when set.';
COMMENT ON COLUMN public.institution_subscriptions.grace_ends_at     IS 'End of grace window after billing failure; read-only fallback until this date.';

CREATE INDEX idx_inst_subs_institution ON public.institution_subscriptions (institution_id);
CREATE INDEX idx_inst_subs_status      ON public.institution_subscriptions (billing_status)
  WHERE billing_status NOT IN ('expired', 'cancelled');

ALTER TABLE public.institution_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_subscriptions FORCE ROW LEVEL SECURITY;

CREATE POLICY inst_subs_super_admin ON public.institution_subscriptions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Institution-admin read policy is added in 20260321000002_institution_admin.sql
-- after institution_memberships exists.

DROP TRIGGER IF EXISTS inst_subs_updated_at ON public.institution_subscriptions;
CREATE TRIGGER inst_subs_updated_at
  BEFORE UPDATE ON public.institution_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 6. FEATURE DEFINITIONS — global feature flag catalog
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

COMMENT ON TABLE  public.feature_definitions                 IS 'Global feature-flag catalog managed by super admin.';
COMMENT ON COLUMN public.feature_definitions.key             IS 'Unique machine key, e.g. game_studio, versus_mode.';
COMMENT ON COLUMN public.feature_definitions.default_enabled IS 'Platform-wide default when no per-institution override exists.';

ALTER TABLE public.feature_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_definitions FORCE ROW LEVEL SECURITY;

CREATE POLICY feature_defs_super_admin ON public.feature_definitions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Authenticated users can read definitions (needed to resolve flags client-side).
CREATE POLICY feature_defs_authenticated_read ON public.feature_definitions
  FOR SELECT TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS feature_defs_updated_at ON public.feature_definitions;
CREATE TRIGGER feature_defs_updated_at
  BEFORE UPDATE ON public.feature_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- 7. INSTITUTION FEATURE OVERRIDES — per-tenant flag overrides + audit trail
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.institution_feature_overrides (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  feature_key     text        NOT NULL REFERENCES public.feature_definitions(key) ON DELETE CASCADE,
  enabled         boolean     NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inst_feature_override_unique UNIQUE (institution_id, feature_key)
);

COMMENT ON TABLE  public.institution_feature_overrides             IS 'Per-institution feature flag overrides (replaces global default).';
COMMENT ON COLUMN public.institution_feature_overrides.feature_key IS 'FK to feature_definitions.key.';
COMMENT ON COLUMN public.institution_feature_overrides.enabled     IS 'Override value for this tenant; replaces default_enabled.';

CREATE INDEX idx_inst_feat_overrides_institution
  ON public.institution_feature_overrides (institution_id);

ALTER TABLE public.institution_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_feature_overrides FORCE ROW LEVEL SECURITY;

CREATE POLICY inst_feat_overrides_super_admin ON public.institution_feature_overrides
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Member read policy added in 20260321000002_institution_admin.sql.

DROP TRIGGER IF EXISTS inst_feat_overrides_updated_at ON public.institution_feature_overrides;
CREATE TRIGGER inst_feat_overrides_updated_at
  BEFORE UPDATE ON public.institution_feature_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Immutable audit trail for every feature-override change (required by 01_Super_Admin.md).
CREATE OR REPLACE FUNCTION audit.log_feature_override_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type     := CASE TG_OP
                          WHEN 'INSERT' THEN 'feature_override.created'
                          WHEN 'DELETE' THEN 'feature_override.deleted'
                          ELSE 'feature_override.updated'
                        END,
    p_subject_type   := 'institution_feature_override',
    p_subject_id     := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload        := jsonb_build_object(
      'feature_key',      COALESCE(NEW.feature_key, OLD.feature_key),
      'enabled',          NEW.enabled,
      'previous_enabled', CASE TG_OP WHEN 'UPDATE' THEN OLD.enabled ELSE NULL END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_feature_override ON public.institution_feature_overrides;
CREATE TRIGGER trg_audit_feature_override
  AFTER INSERT OR UPDATE OR DELETE ON public.institution_feature_overrides
  FOR EACH ROW EXECUTE FUNCTION audit.log_feature_override_change();
