-- When an institution_admin redeems their invite, flip the institution
-- from 'pending' to 'active'. This keeps the institution in pending state
-- until the admin actually signs up and accepts.

CREATE OR REPLACE FUNCTION public.redeem_institution_invite(p_token uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
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
      RAISE EXCEPTION 'membership already exists as institution_admin; resolve out of band';
    END IF;

    IF v_mstat = 'active'::public.membership_status THEN
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

  -- When the redeemed invite is for institution_admin, activate the institution
  IF inv.membership_role = 'institution_admin'::public.membership_role THEN
    UPDATE public.institutions
    SET status = 'active'::institution_status, updated_at = now()
    WHERE id = inv.institution_id
      AND status = 'pending'::institution_status;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_institution_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_institution_invite(uuid) TO authenticated;

COMMENT ON FUNCTION public.redeem_institution_invite(uuid) IS
  'Authenticated user: accepts email invite if profile email matches; creates or activates membership, user_institutions, and flips institution to active when role is institution_admin.';
