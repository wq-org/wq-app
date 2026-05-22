-- =============================================================================
-- FIX: Super admin must never become a tenant member
-- =============================================================================
-- Problem
--   trg_institutions_auto_admin_membership (20260522090000) inserted
--   institution_admin memberships for auth.uid() on every institution INSERT,
--   including when the actor is a platform super_admin (wizard / direct insert).
--
-- Solution
--   1) Guard the trigger — skip membership for platform staff.
--   2) Guard create_institution_with_initial_admin — reject super_admin as tenant admin.
--   3) Clean up leaked rows (soft-delete memberships, remove legacy links).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PART 1: Guarded auto-membership trigger (replaces 20260522090000 function body)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.trg_fn_institutions_auto_admin_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF v_actor_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Platform operators must never receive tenant memberships from this trigger.
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = v_actor_id
      AND (p.role = 'super_admin' OR p.is_super_admin IS TRUE)
  ) THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = v_actor_id
  ) THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.institution_memberships m
    WHERE m.user_id        = v_actor_id
      AND m.institution_id = NEW.id
      AND m.deleted_at     IS NULL
  ) THEN
    INSERT INTO public.institution_memberships (
      user_id,
      institution_id,
      membership_role,
      status
    )
    VALUES (
      v_actor_id,
      NEW.id,
      'institution_admin'::public.membership_role,
      'active'::public.membership_status
    );
  END IF;

  INSERT INTO public.user_institutions (user_id, institution_id)
  VALUES (v_actor_id, NEW.id)
  ON CONFLICT (user_id, institution_id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trg_fn_institutions_auto_admin_membership() IS
  'After a new institution row is created, auto-inserts institution_admin membership for '
  'the authenticated non-platform actor (auth.uid()). Skips super_admin / is_super_admin '
  'profiles, service-role contexts (auth.uid() IS NULL), and when a membership already exists.';

-- ---------------------------------------------------------------------------
-- PART 2: create_institution_with_initial_admin — tenant admin cannot be platform staff
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_institution_with_initial_admin(
  p_name text,
  p_initial_admin_user_id uuid DEFAULT NULL,
  p_initial_admin_status public.membership_status DEFAULT 'active'::public.membership_status
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_institution_id uuid;
  v_admin_id       uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (SELECT app.is_super_admin()) THEN
    RAISE EXCEPTION 'Forbidden: only super_admin may create institutions';
  END IF;

  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'p_name is required';
  END IF;

  IF p_initial_admin_status NOT IN ('active'::public.membership_status, 'invited'::public.membership_status) THEN
    RAISE EXCEPTION 'p_initial_admin_status must be active or invited';
  END IF;

  v_admin_id := coalesce(p_initial_admin_user_id, auth.uid());

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_admin_id) THEN
    RAISE EXCEPTION 'initial admin profile not found';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = v_admin_id
      AND (p.role = 'super_admin' OR p.is_super_admin IS TRUE)
  ) THEN
    RAISE EXCEPTION
      'Platform super_admin cannot be assigned as institution member; pass p_initial_admin_user_id for the tenant admin';
  END IF;

  INSERT INTO public.institutions (name)
  VALUES (btrim(p_name))
  RETURNING id INTO v_institution_id;

  INSERT INTO public.institution_memberships (
    user_id, institution_id, membership_role, status
  )
  VALUES (
    v_admin_id, v_institution_id, 'institution_admin'::membership_role, p_initial_admin_status
  );

  IF p_initial_admin_status = 'active'::public.membership_status THEN
    INSERT INTO public.user_institutions (user_id, institution_id)
    VALUES (v_admin_id, v_institution_id)
    ON CONFLICT (user_id, institution_id) DO NOTHING;
  END IF;

  INSERT INTO public.institution_settings (institution_id)
  VALUES (v_institution_id);

  INSERT INTO public.institution_quotas_usage (institution_id)
  VALUES (v_institution_id);

  INSERT INTO public.institution_subscriptions (
    institution_id,
    plan_id,
    billing_status,
    trial_ends_at,
    effective_from
  )
  SELECT
    v_institution_id,
    pc.id,
    'trialing'::billing_status,
    now() + interval '90 days',
    now()
  FROM public.plan_catalog pc
  WHERE pc.code = 'trial'
    AND pc.deleted_at IS NULL
    AND pc.is_active = true
  LIMIT 1;

  RETURN v_institution_id;
END;
$$;

COMMENT ON FUNCTION public.create_institution_with_initial_admin(text, uuid, public.membership_status) IS
  'Super admin only: creates institution and institution_admin membership for a non-platform '
  'initial admin (p_initial_admin_user_id required when caller is super_admin). Legacy user_institutions '
  'only when active; settings, quotas, trial subscription if plan trial exists.';

-- ---------------------------------------------------------------------------
-- PART 3: Cleanup leaked tenant links for platform admins
-- ---------------------------------------------------------------------------

UPDATE public.institution_memberships m
SET
  deleted_at = now(),
  left_institution_at = COALESCE(m.left_institution_at, now()),
  updated_at = now()
FROM public.profiles p
WHERE m.user_id = p.user_id
  AND m.deleted_at IS NULL
  AND (p.role = 'super_admin' OR p.is_super_admin IS TRUE);

DELETE FROM public.user_institutions ui
USING public.profiles p
WHERE ui.user_id = p.user_id
  AND (p.role = 'super_admin' OR p.is_super_admin IS TRUE);

-- ---------------------------------------------------------------------------
-- Verification (manual / CI after db reset):
--   SELECT m.*, p.email FROM institution_memberships m
--   JOIN profiles p ON p.user_id = m.user_id
--   WHERE m.deleted_at IS NULL AND (p.role = 'super_admin' OR p.is_super_admin);
--   -- expect 0 rows
-- ---------------------------------------------------------------------------
