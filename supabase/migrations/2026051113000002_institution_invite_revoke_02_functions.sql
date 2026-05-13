-- =============================================================================
-- INSTITUTION INVITE REVOKE — functions
-- Adds two SECURITY DEFINER RPCs for revocation and updates
-- redeem_institution_invite to refuse revoked rows.
--
--   * revoke_institution_invite(p_invite_id uuid) returns boolean
--       - institution_admin invites: super_admin only.
--       - teacher/student invites:   super_admin OR active institution_admin
--                                    of invite.institution_id.
--       - Idempotent on already-revoked rows (returns false).
--       - Refuses already-accepted rows.
--
--   * revoke_expired_institution_invites(p_institution_id uuid DEFAULT NULL)
--       returns integer
--       - p_institution_id NULL: super_admin only (cleans all institutions).
--       - p_institution_id set:  super_admin OR active institution_admin of
--                                that institution.
--       - Soft-deletes all pending, non-revoked, expired invites; returns count.
--
--   * redeem_institution_invite(p_token uuid): unchanged behavior except the
--     lookup now excludes revoked_at IS NOT NULL.
--
-- Requires: 2026051113000001_institution_invite_revoke_01_schema.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.revoke_institution_invite(p_invite_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  inv         public.institution_invites%ROWTYPE;
  v_is_super  boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO inv
  FROM public.institution_invites
  WHERE id = p_invite_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF inv.accepted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Invite already accepted';
  END IF;

  IF inv.revoked_at IS NOT NULL THEN
    RETURN false;
  END IF;

  v_is_super := (SELECT app.is_super_admin());

  IF inv.membership_role = 'institution_admin'::public.membership_role THEN
    IF NOT v_is_super THEN
      RAISE EXCEPTION 'Forbidden: only super_admin may revoke institution_admin invites';
    END IF;
  ELSE
    IF NOT (v_is_super OR (SELECT app.is_institution_admin(inv.institution_id))) THEN
      RAISE EXCEPTION 'Forbidden';
    END IF;
  END IF;

  UPDATE public.institution_invites
  SET revoked_at = now(),
      revoked_by = auth.uid()
  WHERE id = p_invite_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_institution_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_institution_invite(uuid) TO authenticated;

COMMENT ON FUNCTION public.revoke_institution_invite(uuid) IS
  'Revoke a pending institution invite. Super_admin can revoke any role; institution_admin can revoke teacher/student invites for their own institution. Idempotent on revoked rows; raises if already accepted.';


CREATE OR REPLACE FUNCTION public.revoke_expired_institution_invites(
  p_institution_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_institution_id IS NULL THEN
    IF NOT (SELECT app.is_super_admin()) THEN
      RAISE EXCEPTION 'Forbidden: only super_admin may bulk-clean all institutions';
    END IF;
  ELSE
    IF NOT (
      (SELECT app.is_super_admin())
      OR (SELECT app.is_institution_admin(p_institution_id))
    ) THEN
      RAISE EXCEPTION 'Forbidden';
    END IF;
  END IF;

  WITH updated AS (
    UPDATE public.institution_invites
    SET revoked_at = now(),
        revoked_by = auth.uid()
    WHERE accepted_at IS NULL
      AND revoked_at IS NULL
      AND expires_at < now()
      AND (p_institution_id IS NULL OR institution_id = p_institution_id)
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_count FROM updated;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_expired_institution_invites(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_expired_institution_invites(uuid) TO authenticated;

COMMENT ON FUNCTION public.revoke_expired_institution_invites(uuid) IS
  'Bulk soft-delete pending invites whose expires_at < now(). Super_admin (institution_id NULL) cleans all institutions; institution_admin must pass their institution_id. Returns the count revoked.';


-- Rebuild redeem_institution_invite to refuse revoked rows.
-- The body is identical to 2026051012000002_institution_invite_workflow_02_functions.sql
-- except for the AND i.revoked_at IS NULL guard in the invite lookup.
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
    AND i.revoked_at IS NULL
    AND i.expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid, expired, revoked, or already accepted invite';
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
  'Authenticated user: accepts non-revoked email invite if profile email matches; creates or activates membership, user_institutions, sets profiles.role, flips institution to active when role is institution_admin. revoked_at IS NULL is required on the invite row.';
