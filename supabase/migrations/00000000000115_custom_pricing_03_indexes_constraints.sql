-- =============================================================================
-- CUSTOM PRICING — Indexes and Constraints
-- =============================================================================

-- plan_versions: lookup by plan, fast published-only scan
CREATE INDEX IF NOT EXISTS idx_plan_versions_plan_id
  ON public.plan_versions (plan_id);

CREATE INDEX IF NOT EXISTS idx_plan_versions_plan_id_published
  ON public.plan_versions (plan_id)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_plan_versions_status
  ON public.plan_versions (status);

-- plan_version_entitlements: resolution by version (primary join path)
CREATE INDEX IF NOT EXISTS idx_pve_plan_version_id
  ON public.plan_version_entitlements (plan_version_id);

-- institution_subscriptions: resolve active subscription per institution
CREATE INDEX IF NOT EXISTS idx_institution_subscriptions_plan_version_id
  ON public.institution_subscriptions (plan_version_id)
  WHERE plan_version_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_institution_subscriptions_institution_effective
  ON public.institution_subscriptions (institution_id, effective_from DESC);
