-- =============================================================================
-- SUPER ADMIN — RLS policies
-- Split from 20260321000001_super_admin.sql
-- Requires: 20260209000001_baseline_schema, 20260209000002_super_admin
-- =============================================================================

-- audit.events
ALTER TABLE audit.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit.events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_events_select ON audit.events;
DROP POLICY IF EXISTS events_select_super_admin ON audit.events;
CREATE POLICY events_select_super_admin ON audit.events
  FOR SELECT TO authenticated
  USING ((select app.is_super_admin()) is true);

REVOKE INSERT, UPDATE, DELETE ON audit.events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON audit.events FROM anon;

-- institutions (already has ENABLE from baseline)
ALTER TABLE public.institutions FORCE ROW LEVEL SECURITY;

-- plan_catalog
ALTER TABLE public.plan_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_catalog FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_catalog_super_admin ON public.plan_catalog;
DROP POLICY IF EXISTS plan_catalog_all_super_admin ON public.plan_catalog;
CREATE POLICY plan_catalog_all_super_admin ON public.plan_catalog
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- feature_definitions
ALTER TABLE public.feature_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_definitions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_defs_super_admin ON public.feature_definitions;
DROP POLICY IF EXISTS feature_definitions_all_super_admin ON public.feature_definitions;
CREATE POLICY feature_definitions_all_super_admin ON public.feature_definitions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS feature_defs_authenticated_read ON public.feature_definitions;
DROP POLICY IF EXISTS feature_definitions_select_authenticated ON public.feature_definitions;
CREATE POLICY feature_definitions_select_authenticated ON public.feature_definitions
  FOR SELECT TO authenticated
  USING (true);

-- plan_entitlements
ALTER TABLE public.plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_entitlements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_entitlements_super_admin ON public.plan_entitlements;
DROP POLICY IF EXISTS plan_entitlements_all_super_admin ON public.plan_entitlements;
CREATE POLICY plan_entitlements_all_super_admin ON public.plan_entitlements
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- institution_subscriptions
ALTER TABLE public.institution_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_subscriptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inst_subs_super_admin ON public.institution_subscriptions;
DROP POLICY IF EXISTS institution_subscriptions_all_super_admin ON public.institution_subscriptions;
CREATE POLICY institution_subscriptions_all_super_admin ON public.institution_subscriptions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Institution-admin SELECT added in 20260321000002_institution_admin.sql

-- institution_entitlement_overrides
ALTER TABLE public.institution_entitlement_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_entitlement_overrides FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inst_entitlement_overrides_super_admin ON public.institution_entitlement_overrides;
DROP POLICY IF EXISTS institution_entitlement_overrides_all_super_admin ON public.institution_entitlement_overrides;
CREATE POLICY institution_entitlement_overrides_all_super_admin ON public.institution_entitlement_overrides
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Member read policy in file 2

-- billing_providers
ALTER TABLE public.billing_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_providers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS billing_providers_super_admin ON public.billing_providers;
DROP POLICY IF EXISTS billing_providers_all_super_admin ON public.billing_providers;
CREATE POLICY billing_providers_all_super_admin ON public.billing_providers
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);
