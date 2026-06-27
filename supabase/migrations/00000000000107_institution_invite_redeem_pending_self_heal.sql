-- =============================================================================
-- INSTITUTION INVITE — login-time self-heal
--
-- Problem: handle_new_user always seeds profiles.role = 'student' (privileged
-- roles are never trusted from client signup metadata). The ONLY path that
-- upgrades a profile to its invited role is redeem_institution_invite(token),
-- invoked client-side during invite signup. If that client call does not run
-- or fails, the account is permanently stranded as 'student' — login has no
-- recovery path.
--
-- This adds a token-less, idempotent self-heal RPC that any authenticated user
-- can call (e.g. on login). It finds pending invites addressed to the caller's
-- OWN profile email and redeems each via the existing redeem_institution_invite
-- logic — no redemption logic is duplicated.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Functions / RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.redeem_pending_institution_invites()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_uid     uuid := auth.uid();
  v_email   text;
  v_token   uuid;
  v_count   integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN 0;
  END IF;

  SELECT lower(trim(p.email))
  INTO v_email
  FROM public.profiles p
  WHERE p.user_id = v_uid;

  IF v_email IS NULL OR v_email = '' THEN
    RETURN 0;
  END IF;

  -- Only the caller's own pending, non-revoked, non-expired invites. The email
  -- match scopes the bypass strictly to invites addressed to this user.
  FOR v_token IN
    SELECT i.token
    FROM public.institution_invites i
    WHERE lower(trim(i.email)) = v_email
      AND i.accepted_at IS NULL
      AND i.revoked_at IS NULL
      AND i.expires_at > now()
    ORDER BY i.created_at ASC
  LOOP
    -- Resilient self-heal: one failing invite must not abort the others.
    BEGIN
      PERFORM public.redeem_institution_invite(v_token);
      v_count := v_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'redeem_pending_institution_invites: token % failed: %', v_token, SQLERRM;
    END;
  END LOOP;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.redeem_pending_institution_invites() IS
  'Login-time self-heal: redeems every pending (unaccepted, non-revoked, non-expired) institution invite addressed to the current user''s profile email, reusing redeem_institution_invite. Idempotent; returns the number redeemed. SECURITY DEFINER + row_security=off bounded strictly to auth.uid()''s own email.';

REVOKE ALL ON FUNCTION public.redeem_pending_institution_invites() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_pending_institution_invites() TO authenticated;
