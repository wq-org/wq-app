-- =============================================================================
-- INSTITUTION INVITE WORKFLOW — functions (final state)
-- Consolidates the April 1 → May 10 patch series:
--   * create_institution_invite_by_email: allows institution_admin role + replaces
--     any pending (accepted_at IS NULL) invite for the same (institution_id, email)
--     so resends after expiry never collide with the unique pending index.
--   * create_institution_with_admin_email_invite: super_admin wizard; seeds
--     institution + settings + quotas + trial subscription + 30-minute pending
--     institution_admin invite.
--   * redeem_institution_invite: validates auth + profile email + invite token;
--     handles all membership pre-states (none / inactive / active / already admin)
--     without raising; flips institution pending→active for institution_admin
--     redemptions; updates profiles.role to the invite role.
--     SET row_security = off is baked into the function so internal scans/updates
--     do not recurse through RLS helpers — token + email are validated first.
-- Requires: 20260510120000_institution_invite_workflow_01_schema.sql
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

  DELETE FROM public.institution_invites
  WHERE institution_id = p_institution_id
    AND lower(trim(email)) = v_email
    AND accepted_at IS NULL;

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
  'Institution admin or super_admin: pending email invite; returns token. Replaces any existing pending invite for the same institution and email (accepted_at IS NULL). institution_admin role allowed for bootstrap / re-invite flows.';

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

CREATE OR REPLACE FUNCTION public.redeem_institution_invite(p_token uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_prof  text;
  inv     public.institution_invites%ROWTYPE;
  v_mid   uuid;
  v_mstat public.membership_status;
  v_mrole public.membership_role;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT lower(trim(p.email)) INTO v_prof
  FROM public.profiles p
  WHERE p.user_id = v_uid;

  IF v_prof IS NULL OR v_prof = '' THEN
    RAISE EXCEPTION 'profile email required to redeem invite';
  END IF;

  SELECT * INTO inv
  FROM public.institution_invites i
  WHERE i.token = p_token
    AND i.accepted_at IS NULL
    AND i.expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid, expired, or already accepted invite';
  END IF;

  IF inv.email IS DISTINCT FROM v_prof THEN
    RAISE EXCEPTION 'signed-in email does not match invite';
  END IF;

  SELECT m.id, m.status, m.membership_role
  INTO v_mid, v_mstat, v_mrole
  FROM public.institution_memberships m
  WHERE m.user_id = v_uid
    AND m.institution_id = inv.institution_id
    AND m.deleted_at IS NULL;

  IF v_mid IS NOT NULL THEN
    IF v_mrole = 'institution_admin'::public.membership_role THEN
      -- Membership already exists as institution_admin — accept invite gracefully
      -- and fall through to profile/user_institutions/institution updates below.
      UPDATE public.institution_invites
      SET accepted_at = now(), accepted_user_id = v_uid
      WHERE id = inv.id;
    ELSIF v_mstat = 'active'::public.membership_status THEN
      UPDATE public.institution_invites
      SET accepted_at = now(), accepted_user_id = v_uid
      WHERE id = inv.id;
    ELSE
      UPDATE public.institution_memberships
      SET
        membership_role = inv.membership_role,
        status = 'active'::public.membership_status,
        updated_at = now()
      WHERE id = v_mid;

      UPDATE public.institution_invites
      SET accepted_at = now(), accepted_user_id = v_uid
      WHERE id = inv.id;
    END IF;
  ELSE
    INSERT INTO public.institution_memberships (
      user_id, institution_id, membership_role, status
    )
    VALUES (
      v_uid,
      inv.institution_id,
      inv.membership_role,
      'active'::public.membership_status
    );

    UPDATE public.institution_invites
    SET accepted_at = now(), accepted_user_id = v_uid
    WHERE id = inv.id;
  END IF;

  INSERT INTO public.user_institutions (user_id, institution_id)
  VALUES (v_uid, inv.institution_id)
  ON CONFLICT (user_id, institution_id) DO NOTHING;

  IF inv.membership_role = 'institution_admin'::public.membership_role THEN
    UPDATE public.institutions
    SET status = 'active'::institution_status, updated_at = now()
    WHERE id = inv.institution_id
      AND status = 'pending'::institution_status;
  END IF;

  UPDATE public.profiles
  SET role = inv.membership_role::text,
      updated_at = now()
  WHERE user_id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_institution_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_institution_invite(uuid) TO authenticated;

COMMENT ON FUNCTION public.redeem_institution_invite(uuid) IS
  'Authenticated user: accepts email invite if profile email matches; creates or activates membership, user_institutions, sets profiles.role to invite membership_role, flips institution to active when role is institution_admin. Re-inviting an existing institution_admin gracefully marks the invite accepted (no raise). SET row_security = off avoids RLS re-entry inside the RPC after token + email validation.';
