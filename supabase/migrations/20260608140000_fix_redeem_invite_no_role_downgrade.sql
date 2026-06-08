-- =============================================================================
-- FIX — redeem_institution_invite must never DOWNGRADE profiles.role
--
-- Bug: the function unconditionally ran
--     UPDATE public.profiles SET role = inv.membership_role
-- at the end. When a user who already holds a higher-privileged membership
-- (e.g. institution_admin) redeems a lower invite (e.g. student) for the same
-- institution/email, the graceful branch correctly leaves the membership as
-- institution_admin — but the profile role was still forced to 'student',
-- creating a profiles.role vs institution_memberships.membership_role
-- split-brain (admin shell + "student" routing/counts).
--
-- This became reachable automatically once login-time self-heal
-- (redeem_pending_institution_invites) started redeeming stray pending invites.
--
-- Fix: introduce app.role_rank() precedence and make the profile-role write
-- UPGRADE-ONLY (never lower an existing role; never touch super_admin).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5. Functions / RPC
-- -----------------------------------------------------------------------------

-- Role privilege precedence: super_admin > institution_admin > teacher > student.
CREATE OR REPLACE FUNCTION app.role_rank(p_role text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE lower(coalesce(p_role, ''))
    WHEN 'super_admin'       THEN 4
    WHEN 'institution_admin' THEN 3
    WHEN 'teacher'           THEN 2
    WHEN 'student'           THEN 1
    ELSE 0
  END;
$$;

COMMENT ON FUNCTION app.role_rank(text) IS
  'Privilege precedence for app roles (super_admin=4 > institution_admin=3 > teacher=2 > student=1, unknown=0). Used to prevent silent role downgrades.';

REVOKE ALL ON FUNCTION app.role_rank(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.role_rank(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_institution_invite(p_token uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth, pg_temp
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

  -- Set profiles.role to the invited role ONLY when it is a strict upgrade.
  -- Redeeming a lower-privileged invite must never downgrade the profile role
  -- (no admin -> student split-brain); super_admin is never touched.
  UPDATE public.profiles p
  SET role = inv.membership_role::text,
      updated_at = now()
  WHERE p.user_id = v_uid
    AND COALESCE(p.is_super_admin, false) IS NOT TRUE
    AND p.role IS DISTINCT FROM 'super_admin'
    AND app.role_rank(inv.membership_role::text) > app.role_rank(p.role);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_institution_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_institution_invite(uuid) TO authenticated;

COMMENT ON FUNCTION public.redeem_institution_invite(uuid) IS
  'Authenticated user: accepts email invite if profile email matches; creates or activates membership, user_institutions, flips institution to active when role is institution_admin. profiles.role is updated to the invited role ONLY when it is a strict upgrade (app.role_rank) so a lower invite never downgrades a higher role. SET row_security = off avoids RLS re-entry after token + email validation.';
