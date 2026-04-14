-- =============================================================================
-- Institution bootstrap via admin email invite (super_admin wizard)
-- Extends institution_invites to allow institution_admin; adds RPC that seeds
-- institution + settings + quotas + trial + pending invite (no membership until redeem).
-- =============================================================================

ALTER TABLE public.institution_invites
  DROP CONSTRAINT IF EXISTS chk_institution_invites_membership_role;

ALTER TABLE public.institution_invites
  ADD CONSTRAINT chk_institution_invites_membership_role CHECK (
    membership_role IN (
      'teacher'::public.membership_role,
      'student'::public.membership_role,
      'institution_admin'::public.membership_role
    )
  );

COMMENT ON CONSTRAINT chk_institution_invites_membership_role ON public.institution_invites IS
  'Email invites may target teacher, student, or institution_admin (bootstrap wizard).';

-- =============================================================================
-- Allow institution_admin in create_institution_invite_by_email
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_institution_invite_by_email(
  p_institution_id uuid,
  p_email text,
  p_role public.membership_role,
  p_expires_in interval DEFAULT '14 days'::interval
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_token uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin())
    OR (SELECT app.is_institution_admin(p_institution_id))
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF p_role NOT IN (
    'teacher'::public.membership_role,
    'student'::public.membership_role,
    'institution_admin'::public.membership_role
  ) THEN
    RAISE EXCEPTION 'p_role must be teacher, student, or institution_admin';
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'p_email is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.institutions i WHERE i.id = p_institution_id AND i.deleted_at IS NULL) THEN
    RAISE EXCEPTION 'institution not found';
  END IF;

  INSERT INTO public.institution_invites (
    institution_id,
    email,
    membership_role,
    expires_at,
    invited_by
  )
  VALUES (
    p_institution_id,
    v_email,
    p_role,
    now() + p_expires_in,
    auth.uid()
  )
  RETURNING token INTO v_token;

  RETURN v_token;
END;
$$;

COMMENT ON FUNCTION public.create_institution_invite_by_email(uuid, text, public.membership_role, interval) IS
  'Institution admin or super_admin: pending email invite; returns token. institution_admin role allowed for bootstrap / re-invite flows.';

-- =============================================================================
-- Bootstrap: institution + seed rows + institution_admin email invite (no membership yet)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_institution_with_admin_email_invite(
  p_name text,
  p_admin_email text,
  p_expires_in interval DEFAULT '30 minutes'::interval
)
RETURNS TABLE(institution_id uuid, invite_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_institution_id uuid;
  v_token          uuid;
  v_email          text := lower(trim(p_admin_email));
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

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'p_admin_email is required';
  END IF;

  INSERT INTO public.institutions (name, created_by_admin_id)
  VALUES (btrim(p_name), auth.uid())
  RETURNING id INTO v_institution_id;

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

  INSERT INTO public.institution_invites (
    institution_id,
    email,
    membership_role,
    expires_at,
    invited_by
  )
  VALUES (
    v_institution_id,
    v_email,
    'institution_admin'::public.membership_role,
    now() + p_expires_in,
    auth.uid()
  )
  RETURNING token INTO v_token;

  institution_id := v_institution_id;
  invite_token := v_token;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.create_institution_with_admin_email_invite(text, text, interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_institution_with_admin_email_invite(text, text, interval) TO authenticated;

COMMENT ON FUNCTION public.create_institution_with_admin_email_invite(text, text, interval) IS
  'Super admin: creates institution (name + created_by), settings, quotas, trial subscription if available, and pending institution_admin email invite (default expiry 30 minutes); redeem_institution_invite after signup.';
