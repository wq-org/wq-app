-- =============================================================================
-- CUSTOM PRICING — Tables
-- Layer 2: plan_versions (immutable snapshot) + plan_version_entitlements (frozen matrix).
-- Layer 3 binding: plan_version_id FK added to institution_subscriptions.
-- Follows principle_custom_pricing.md §Detailed Requirements / Data model.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- plan_versions — immutable, version-numbered snapshot of a plan at publish time
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plan_versions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id              uuid        NOT NULL REFERENCES public.plan_catalog (id) ON DELETE CASCADE,
  version_no           integer     NOT NULL,
  status               public.plan_version_status NOT NULL DEFAULT 'draft',
  -- commercial fields frozen at publish time (copied from plan_catalog)
  name                 text        NOT NULL,
  price_amount         numeric(12,2),
  currency             text        NOT NULL DEFAULT 'EUR',
  billing_interval     text        NOT NULL,
  change_note          text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  published_at         timestamptz,
  archived_at          timestamptz,
  CONSTRAINT uq_plan_versions_plan_version UNIQUE (plan_id, version_no)
);

COMMENT ON TABLE public.plan_versions IS
  'Immutable version snapshot of a plan at publish time — the contractual "what was sold." '
  'Once published, content is append-only. Only status→archived is permitted as a post-publish change.';
COMMENT ON COLUMN public.plan_versions.version_no IS
  'Monotonically increasing per plan_id; assigned by publish_plan_version RPC.';
COMMENT ON COLUMN public.plan_versions.billing_interval IS
  'Copied from plan_catalog at publish: monthly | annual | none.';
COMMENT ON COLUMN public.plan_versions.change_note IS
  'Super-admin supplied note describing what changed in this version.';

-- -----------------------------------------------------------------------------
-- plan_version_entitlements — frozen copy of the entitlement matrix at publish time
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.plan_version_entitlements (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_version_id  uuid NOT NULL REFERENCES public.plan_versions (id) ON DELETE CASCADE,
  feature_id       uuid NOT NULL REFERENCES public.feature_definitions (id) ON DELETE RESTRICT,
  -- denormalized so the snapshot survives a later feature rename/delete
  feature_key      text NOT NULL,
  value_type       public.entitlement_value_type NOT NULL,
  boolean_value    boolean,
  integer_value    integer,
  bigint_value     bigint,
  text_value       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_pve_version_feature UNIQUE (plan_version_id, feature_id)
);

COMMENT ON TABLE public.plan_version_entitlements IS
  'Frozen entitlement matrix for a specific plan_version. Insert-only: no UPDATE or DELETE '
  'after the parent version is published. Denormalized feature_key survives feature renames.';
COMMENT ON COLUMN public.plan_version_entitlements.feature_key IS
  'Denormalized stable key (e.g. game_studio) copied at publish time.';

-- -----------------------------------------------------------------------------
-- institution_subscriptions — add plan_version_id binding (Layer 3)
-- Keep legacy plan_id for back-compat; new flow populates both.
-- -----------------------------------------------------------------------------
ALTER TABLE public.institution_subscriptions
  ADD COLUMN IF NOT EXISTS plan_version_id uuid
    REFERENCES public.plan_versions (id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.institution_subscriptions.plan_version_id IS
  'Pinned plan_version_id (Layer 3 binding per principle_custom_pricing.md). '
  'NULL for legacy rows until backfill migration runs.';
