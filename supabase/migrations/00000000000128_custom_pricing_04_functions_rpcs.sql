-- =============================================================================
-- CUSTOM PRICING — Functions and RPCs
--
-- 1. app.publish_plan_version        — super-admin: freeze draft → published snapshot
-- 2. app.assign_plan_version_to_institution — super-admin: pin version to institution
-- 3. app.activate_subscription_on_payment  — super-admin / service-role: flip to active
-- 4. public.list_my_institution_feature_flags (REPLACED)
--       — reads frozen plan_version_entitlements; source = 'plan_version' | 'override' | 'default'
--
-- All: SECURITY DEFINER, SET search_path = '', SET row_security = off (bounded reads)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. app.publish_plan_version
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.publish_plan_version(
  p_plan_id    uuid,
  p_change_note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  v_version_no integer;
  v_version_id uuid;
  v_plan       public.plan_catalog%ROWTYPE;
BEGIN
  IF NOT (SELECT app.is_super_admin()) THEN
    RAISE EXCEPTION 'publish_plan_version: super-admin required';
  END IF;

  SELECT * INTO v_plan FROM public.plan_catalog WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'publish_plan_version: plan % not found', p_plan_id;
  END IF;

  SELECT COALESCE(MAX(version_no), 0) + 1
  INTO v_version_no
  FROM public.plan_versions
  WHERE plan_id = p_plan_id;

  INSERT INTO public.plan_versions (
    plan_id, version_no, status,
    name, price_amount, currency, billing_interval,
    change_note, published_at
  ) VALUES (
    p_plan_id, v_version_no, 'published',
    v_plan.name, v_plan.price_amount, COALESCE(v_plan.currency, 'EUR'), v_plan.billing_interval,
    p_change_note, now()
  )
  RETURNING id INTO v_version_id;

  -- Copy the full current entitlement matrix into the immutable snapshot
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
  WHERE pe.plan_id = p_plan_id;

  PERFORM audit.log_event(
    p_event_type    := 'plan_version.published',
    p_subject_type  := 'plan_version',
    p_subject_id    := v_version_id,
    p_payload       := jsonb_build_object(
      'plan_id',    p_plan_id,
      'version_no', v_version_no
    ),
    p_metadata      := jsonb_build_object(
      'visibility_level', 'super_admin',
      'context', jsonb_build_object('plan_code', v_plan.code)
    )
  );

  RETURN v_version_id;
END;
$$;

COMMENT ON FUNCTION app.publish_plan_version(uuid, text) IS
  'Super-admin: freeze current plan_entitlements into an immutable plan_versions snapshot. Returns new version id.';

REVOKE ALL ON FUNCTION app.publish_plan_version(uuid, text) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 2. app.assign_plan_version_to_institution
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.assign_plan_version_to_institution(
  p_institution_id    uuid,
  p_plan_version_id   uuid,
  p_billing_interval  text,
  p_seats_cap         integer  DEFAULT NULL,
  p_storage_bytes_cap bigint   DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  v_version    public.plan_versions%ROWTYPE;
  v_sub_id     uuid;
BEGIN
  IF NOT (SELECT app.is_super_admin()) THEN
    RAISE EXCEPTION 'assign_plan_version_to_institution: super-admin required';
  END IF;

  SELECT * INTO v_version FROM public.plan_versions WHERE id = p_plan_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'assign_plan_version_to_institution: plan_version % not found', p_plan_version_id;
  END IF;
  IF v_version.status <> 'published' THEN
    RAISE EXCEPTION 'assign_plan_version_to_institution: only published versions may be assigned (status=%))', v_version.status;
  END IF;

  -- End-date the current active subscription
  UPDATE public.institution_subscriptions
  SET effective_to = now()
  WHERE institution_id = p_institution_id
    AND effective_to IS NULL;

  INSERT INTO public.institution_subscriptions (
    institution_id, plan_id, plan_version_id,
    billing_status, effective_from,
    seats_cap, storage_bytes_cap
  ) VALUES (
    p_institution_id, v_version.plan_id, p_plan_version_id,
    'trialing', now(),
    p_seats_cap, p_storage_bytes_cap
  )
  RETURNING id INTO v_sub_id;

  PERFORM audit.log_event(
    p_event_type   := 'subscription.assigned',
    p_subject_type := 'institution_subscription',
    p_subject_id   := v_sub_id,
    p_institution_id := p_institution_id,
    p_payload      := jsonb_build_object(
      'plan_version_id',  p_plan_version_id,
      'billing_interval', p_billing_interval,
      'billing_status',   'trialing'
    ),
    p_metadata     := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'plan_id',     v_version.plan_id,
        'version_no',  v_version.version_no
      )
    )
  );

  RETURN v_sub_id;
END;
$$;

COMMENT ON FUNCTION app.assign_plan_version_to_institution(uuid, uuid, text, integer, bigint) IS
  'Super-admin: pin a published plan_version to an institution. Ends the prior active subscription.';

REVOKE ALL ON FUNCTION app.assign_plan_version_to_institution(uuid, uuid, text, integer, bigint) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 3. app.activate_subscription_on_payment
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.activate_subscription_on_payment(
  p_subscription_id          uuid,
  p_period_start             timestamptz,
  p_period_end               timestamptz,
  p_provider                 text    DEFAULT NULL,
  p_external_subscription_id text    DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  v_sub public.institution_subscriptions%ROWTYPE;
BEGIN
  -- Callable by super-admin or service_role (PSP webhook via service key)
  IF NOT (SELECT app.is_super_admin())
     AND current_setting('request.jwt.claims', TRUE)::jsonb->>'role' <> 'service_role' THEN
    RAISE EXCEPTION 'activate_subscription_on_payment: super-admin or service_role required';
  END IF;

  SELECT * INTO v_sub FROM public.institution_subscriptions WHERE id = p_subscription_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'activate_subscription_on_payment: subscription % not found', p_subscription_id;
  END IF;

  UPDATE public.institution_subscriptions SET
    billing_status         = 'active',
    current_period_start   = p_period_start,
    current_period_end     = p_period_end,
    renewal_at             = p_period_end,
    updated_at             = now()
  WHERE id = p_subscription_id;

  -- Upsert billing_providers linkage when provider details supplied
  IF p_provider IS NOT NULL THEN
    INSERT INTO public.billing_providers (institution_id, provider, external_subscription_id)
    VALUES (v_sub.institution_id, p_provider, p_external_subscription_id)
    ON CONFLICT (institution_id, provider)
    DO UPDATE SET
      external_subscription_id = EXCLUDED.external_subscription_id,
      updated_at               = now();
  END IF;

  PERFORM audit.log_event(
    p_event_type   := 'subscription.activated',
    p_subject_type := 'institution_subscription',
    p_subject_id   := p_subscription_id,
    p_institution_id := v_sub.institution_id,
    p_payload      := jsonb_build_object(
      'billing_status',   'active',
      'period_start',     p_period_start,
      'period_end',       p_period_end
    ),
    p_metadata     := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'plan_version_id', v_sub.plan_version_id,
        'plan_id',         v_sub.plan_id
      )
    )
  );
END;
$$;

COMMENT ON FUNCTION app.activate_subscription_on_payment(uuid, timestamptz, timestamptz, text, text) IS
  'Super-admin or service_role (PSP webhook): flip subscription to active, set period, upsert billing_providers.';

REVOKE ALL ON FUNCTION app.activate_subscription_on_payment(uuid, timestamptz, timestamptz, text, text) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- 4. public.list_my_institution_feature_flags (REPLACED)
--    Resolves: override → plan_version (active/grace sub only) → feature default
--    source returns: 'override' | 'plan_version' | 'default'
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.list_my_institution_feature_flags()
RETURNS TABLE (
  plan_code           text,
  feature_id          uuid,
  feature_key         text,
  feature_name        text,
  feature_description text,
  feature_category    text,
  value_type          text,
  default_enabled     boolean,
  boolean_value       boolean,
  integer_value       integer,
  bigint_value        bigint,
  text_value          text,
  source              text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  v_uid            uuid;
  v_institution_id uuid;
  v_plan_id        uuid;
  v_plan_version_id uuid;
  v_plan_code      text;
BEGIN
  v_uid := (SELECT auth.uid());
  IF v_uid IS NULL THEN RETURN; END IF;

  SELECT
    COALESCE(
      p.active_institution_id,
      (SELECT ui.institution_id
       FROM public.user_institutions AS ui
       WHERE ui.user_id = v_uid
       ORDER BY ui.institution_id LIMIT 1),
      (SELECT m.institution_id
       FROM public.institution_memberships AS m
       WHERE m.user_id = v_uid
         AND m.status = 'active'::public.membership_status
         AND m.deleted_at IS NULL
         AND m.left_institution_at IS NULL
       ORDER BY m.institution_id LIMIT 1)
    )
  INTO v_institution_id
  FROM public.profiles AS p
  WHERE p.user_id = v_uid;

  IF v_institution_id IS NULL THEN RETURN; END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.institution_memberships AS m
    WHERE m.user_id = v_uid
      AND m.institution_id = v_institution_id
      AND m.status = 'active'::public.membership_status
      AND m.deleted_at IS NULL
      AND m.left_institution_at IS NULL
  ) THEN
    RETURN;
  END IF;

  -- Resolve the active (or grace) subscription — plan_version takes precedence
  SELECT s.plan_id, s.plan_version_id
  INTO v_plan_id, v_plan_version_id
  FROM public.institution_subscriptions AS s
  WHERE s.institution_id = v_institution_id
    AND s.billing_status IN ('active', 'grace')
    AND (s.grace_ends_at IS NULL OR s.grace_ends_at > now())
  ORDER BY s.effective_from DESC
  LIMIT 1;

  -- Fall back to the most recent subscription for plan_code display only
  IF v_plan_id IS NULL THEN
    SELECT s.plan_id, s.plan_version_id
    INTO v_plan_id, v_plan_version_id
    FROM public.institution_subscriptions AS s
    WHERE s.institution_id = v_institution_id
    ORDER BY s.effective_from DESC
    LIMIT 1;
    -- Non-active: no paid entitlements — null out version so only defaults apply
    v_plan_version_id := NULL;
  END IF;

  IF v_plan_id IS NOT NULL THEN
    SELECT pc.code INTO v_plan_code
    FROM public.plan_catalog AS pc WHERE pc.id = v_plan_id;
  END IF;

  RETURN QUERY
  SELECT
    v_plan_code                                AS plan_code,
    fd.id                                      AS feature_id,
    fd.key                                     AS feature_key,
    COALESCE(fd.name, fd.key)::text            AS feature_name,
    COALESCE(fd.description, '')::text         AS feature_description,
    COALESCE(fd.category, 'none')::text        AS feature_category,
    fd.value_type::text                        AS value_type,
    fd.default_enabled                         AS default_enabled,
    CASE
      WHEN o.id IS NOT NULL            THEN o.boolean_value
      WHEN pve.id IS NOT NULL          THEN pve.boolean_value
      WHEN fd.value_type = 'boolean'::public.entitlement_value_type THEN fd.default_enabled
      ELSE NULL
    END                                        AS boolean_value,
    CASE
      WHEN o.id IS NOT NULL  THEN o.integer_value
      WHEN pve.id IS NOT NULL THEN pve.integer_value
      ELSE NULL
    END                                        AS integer_value,
    CASE
      WHEN o.id IS NOT NULL  THEN o.bigint_value
      WHEN pve.id IS NOT NULL THEN pve.bigint_value
      ELSE NULL
    END                                        AS bigint_value,
    CASE
      WHEN o.id IS NOT NULL  THEN o.text_value
      WHEN pve.id IS NOT NULL THEN pve.text_value
      ELSE NULL
    END                                        AS text_value,
    CASE
      WHEN o.id IS NOT NULL   THEN 'override'::text
      WHEN pve.id IS NOT NULL THEN 'plan_version'::text
      ELSE 'default'::text
    END                                        AS source
  FROM public.feature_definitions AS fd
  LEFT JOIN public.plan_version_entitlements AS pve
    ON pve.feature_id = fd.id
    AND v_plan_version_id IS NOT NULL
    AND pve.plan_version_id = v_plan_version_id
  LEFT JOIN public.institution_entitlement_overrides AS o
    ON o.feature_id = fd.id
    AND o.institution_id = v_institution_id
    AND (o.starts_at IS NULL OR o.starts_at <= now())
    AND (o.ends_at IS NULL OR o.ends_at > now())
  ORDER BY COALESCE(fd.category, 'none'), COALESCE(fd.name, fd.key);
END;
$$;

COMMENT ON FUNCTION public.list_my_institution_feature_flags() IS
  'Active institution members: effective feature flags resolved from frozen plan_version_entitlements '
  '(active/grace subscription only) + overrides. source: override | plan_version | default.';

REVOKE ALL ON FUNCTION public.list_my_institution_feature_flags() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_my_institution_feature_flags() TO authenticated;
