-- =============================================================================
-- SUPER ADMIN — Indexes and constraints
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_events_institution_id_occurred_at ON audit.events (institution_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_actor_user_id_occurred_at       ON audit.events (actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_type_occurred_at        ON audit.events (event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_institutions_health_state
  ON public.institutions (health_state)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_plan_entitlements_plan_id ON public.plan_entitlements (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_entitlements_feature_id ON public.plan_entitlements (feature_id);

DROP INDEX IF EXISTS idx_inst_subs_institution;
DROP INDEX IF EXISTS idx_inst_subs_status;
CREATE INDEX IF NOT EXISTS idx_institution_subscriptions_institution_id ON public.institution_subscriptions (institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_subscriptions_billing_status ON public.institution_subscriptions (billing_status)
  WHERE billing_status NOT IN ('expired', 'cancelled', 'suspended');

CREATE INDEX idx_institution_entitlement_overrides_institution_id
  ON public.institution_entitlement_overrides (institution_id);

CREATE INDEX IF NOT EXISTS idx_billing_providers_institution_id ON public.billing_providers (institution_id);
