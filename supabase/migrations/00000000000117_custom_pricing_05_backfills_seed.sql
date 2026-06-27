-- =============================================================================
-- CUSTOM PRICING — Backfill / Seed
--
-- For every existing plan_catalog row that has plan_entitlements, publishes a
-- version_no = 1 snapshot and repoints any live institution_subscriptions rows
-- to that snapshot.  Idempotent: skips plans that already have a version_no = 1.
-- =============================================================================

DO $$
DECLARE
  r_plan       RECORD;
  v_version_id uuid;
BEGIN
  FOR r_plan IN
    SELECT pc.id AS plan_id, pc.name, pc.price_amount, pc.currency, pc.billing_interval
    FROM public.plan_catalog AS pc
    WHERE NOT EXISTS (
      SELECT 1 FROM public.plan_versions AS pv
      WHERE pv.plan_id = pc.id AND pv.version_no = 1
    )
  LOOP
    -- Create a published version_no = 1 snapshot
    INSERT INTO public.plan_versions (
      plan_id, version_no, status,
      name, price_amount, currency, billing_interval,
      change_note, published_at
    ) VALUES (
      r_plan.plan_id, 1, 'published',
      r_plan.name, r_plan.price_amount, COALESCE(r_plan.currency, 'EUR'), r_plan.billing_interval,
      'Initial snapshot — backfill migration', now()
    )
    RETURNING id INTO v_version_id;

    -- Freeze entitlement matrix
    INSERT INTO public.plan_version_entitlements (
      plan_version_id, feature_id, feature_key, value_type,
      boolean_value, integer_value, bigint_value, text_value
    )
    SELECT
      v_version_id,
      fd.id,
      fd.key,
      fd.value_type,
      pe.boolean_value,
      pe.integer_value,
      pe.bigint_value,
      pe.text_value
    FROM public.plan_entitlements AS pe
    JOIN public.feature_definitions AS fd ON fd.id = pe.feature_id
    WHERE pe.plan_id = r_plan.plan_id;

    -- Repoint live subscriptions for this plan to the new version snapshot
    UPDATE public.institution_subscriptions
    SET plan_version_id = v_version_id
    WHERE plan_id = r_plan.plan_id
      AND plan_version_id IS NULL;
  END LOOP;
END;
$$;
