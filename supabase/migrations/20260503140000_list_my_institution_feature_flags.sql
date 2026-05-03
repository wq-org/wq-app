-- =============================================================================
-- MEMBER FEATURE FLAGS — effective entitlements for active institution
-- =============================================================================
-- Exposes public.list_my_institution_feature_flags(): SECURITY DEFINER RPC so
-- teachers/students (and any active member) can resolve plan + overrides
-- without SELECT on institution_subscriptions under member RLS.
--
-- Institution resolution matches the app profile: getCompleteProfile uses
-- user_institutions (legacy) for userInstitutionId; many users have NULL
-- profiles.active_institution_id. Resolve tenant as:
--   COALESCE(active_institution_id, user_institutions, active institution_memberships).

CREATE OR REPLACE FUNCTION public.list_my_institution_feature_flags()
RETURNS TABLE (
  plan_code text,
  feature_id uuid,
  feature_key text,
  feature_name text,
  feature_description text,
  feature_category text,
  value_type text,
  default_enabled boolean,
  boolean_value boolean,
  integer_value integer,
  bigint_value bigint,
  text_value text,
  source text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  v_uid uuid;
  v_institution_id uuid;
  v_plan_id uuid;
  v_plan_code text;
BEGIN
  v_uid := (SELECT auth.uid());
  IF v_uid IS NULL THEN
    RETURN;
  END IF;

  SELECT
    COALESCE(
      p.active_institution_id,
      (SELECT ui.institution_id
       FROM public.user_institutions AS ui
       WHERE ui.user_id = v_uid
       ORDER BY ui.institution_id
       LIMIT 1),
      (SELECT m.institution_id
       FROM public.institution_memberships AS m
       WHERE m.user_id = v_uid
         AND m.status = 'active'::public.membership_status
         AND m.deleted_at IS NULL
         AND m.left_institution_at IS NULL
       ORDER BY m.institution_id
       LIMIT 1)
    )
  INTO v_institution_id
  FROM public.profiles AS p
  WHERE p.user_id = v_uid;

  IF v_institution_id IS NULL THEN
    RETURN;
  END IF;

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

  SELECT s.plan_id
  INTO v_plan_id
  FROM public.institution_subscriptions AS s
  WHERE s.institution_id = v_institution_id
  ORDER BY s.effective_from DESC
  LIMIT 1;

  IF v_plan_id IS NOT NULL THEN
    SELECT pc.code
    INTO v_plan_code
    FROM public.plan_catalog AS pc
    WHERE pc.id = v_plan_id;
  END IF;

  RETURN QUERY
  SELECT
    v_plan_code AS plan_code,
    fd.id AS feature_id,
    fd.key AS feature_key,
    COALESCE(fd.name, fd.key)::text AS feature_name,
    COALESCE(fd.description, '')::text AS feature_description,
    COALESCE(fd.category, 'none')::text AS feature_category,
    fd.value_type::text AS value_type,
    fd.default_enabled AS default_enabled,
    CASE
      WHEN o.id IS NOT NULL THEN o.boolean_value
      WHEN pe.id IS NOT NULL THEN pe.boolean_value
      WHEN fd.value_type = 'boolean'::public.entitlement_value_type THEN fd.default_enabled
      ELSE NULL
    END AS boolean_value,
    CASE
      WHEN o.id IS NOT NULL THEN o.integer_value
      WHEN pe.id IS NOT NULL THEN pe.integer_value
      ELSE NULL
    END AS integer_value,
    CASE
      WHEN o.id IS NOT NULL THEN o.bigint_value
      WHEN pe.id IS NOT NULL THEN pe.bigint_value
      ELSE NULL
    END AS bigint_value,
    CASE
      WHEN o.id IS NOT NULL THEN o.text_value
      WHEN pe.id IS NOT NULL THEN pe.text_value
      ELSE NULL
    END AS text_value,
    CASE
      WHEN o.id IS NOT NULL THEN 'override'::text
      WHEN pe.id IS NOT NULL THEN 'plan'::text
      ELSE 'default'::text
    END AS source
  FROM public.feature_definitions AS fd
  LEFT JOIN public.plan_entitlements AS pe
    ON pe.feature_id = fd.id
    AND v_plan_id IS NOT NULL
    AND pe.plan_id = v_plan_id
  LEFT JOIN public.institution_entitlement_overrides AS o
    ON o.feature_id = fd.id
    AND o.institution_id = v_institution_id
  ORDER BY COALESCE(fd.category, 'none'), COALESCE(fd.name, fd.key);
END;
$$;

COMMENT ON FUNCTION public.list_my_institution_feature_flags() IS
  'Active institution members: effective feature flags. Institution = COALESCE(profiles.active_institution_id, user_institutions, active institution_memberships).';

REVOKE ALL ON FUNCTION public.list_my_institution_feature_flags() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_my_institution_feature_flags() TO authenticated;
