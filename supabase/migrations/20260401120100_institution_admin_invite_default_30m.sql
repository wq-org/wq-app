-- If 20260401120000 was already applied with 14-day default, align bootstrap invite TTL to 30 minutes.
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

COMMENT ON FUNCTION public.create_institution_with_admin_email_invite(text, text, interval) IS
  'Super admin: creates institution (name + created_by), settings, quotas, trial subscription if available, and pending institution_admin email invite (default expiry 30 minutes); redeem_institution_invite after signup.';
