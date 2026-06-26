-- =============================================================================
-- CUSTOM PRICING — RLS Policies
--
-- plan_versions:            super-admin ALL; subscribed institution SELECT
-- plan_version_entitlements: super-admin ALL; subscribed institution SELECT
-- All writes go through SECURITY DEFINER RPCs — no INSERT/UPDATE/DELETE policy
-- for non-super-admins.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- plan_versions
-- ---------------------------------------------------------------------------
ALTER TABLE public.plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_versions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plan_versions_super_admin_all ON public.plan_versions;
CREATE POLICY plan_versions_super_admin_all ON public.plan_versions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

-- Institution admins and members may SELECT only the version their institution
-- currently subscribes to.
DROP POLICY IF EXISTS plan_versions_select_subscribed_institution ON public.plan_versions;
CREATE POLICY plan_versions_select_subscribed_institution ON public.plan_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.institution_subscriptions AS s
      WHERE s.plan_version_id = plan_versions.id
        AND s.institution_id = (SELECT app.get_current_institution_id())
        AND s.effective_to IS NULL
    )
  );

-- ---------------------------------------------------------------------------
-- plan_version_entitlements
-- ---------------------------------------------------------------------------
ALTER TABLE public.plan_version_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_version_entitlements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pve_super_admin_all ON public.plan_version_entitlements;
CREATE POLICY pve_super_admin_all ON public.plan_version_entitlements
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS pve_select_subscribed_institution ON public.plan_version_entitlements;
CREATE POLICY pve_select_subscribed_institution ON public.plan_version_entitlements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.institution_subscriptions AS s
      WHERE s.plan_version_id = plan_version_entitlements.plan_version_id
        AND s.institution_id = (SELECT app.get_current_institution_id())
        AND s.effective_to IS NULL
    )
  );
