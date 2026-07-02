-- =============================================================================
-- CUSTOM PRICING — Types
-- Adds plan_version_status enum and is_custom flag on plan_catalog.
-- Follows principle_custom_pricing.md + principle_database.md.
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.plan_version_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE public.plan_version_status IS
  'Lifecycle of a plan version snapshot. Only published versions may be assigned to institutions.';

-- is_custom flag: bespoke per-institution plans live in the same plan_catalog
-- but are hidden from generic listings by this flag.
ALTER TABLE public.plan_catalog
  ADD COLUMN IF NOT EXISTS is_custom boolean NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.plan_catalog.is_custom IS
  'TRUE for bespoke per-institution plans; hidden from generic public catalog listings.';
