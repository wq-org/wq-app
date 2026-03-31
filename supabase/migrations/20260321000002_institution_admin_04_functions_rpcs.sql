-- =============================================================================
-- INSTITUTION ADMIN — Functions & RPCs
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- =============================================================================
-- 4. APP HELPERS — depend on institution_memberships
-- =============================================================================

-- Set-returning: use in policies as institution_id IN (select app.xxx())
-- for initPlan-cached evaluation.
CREATE OR REPLACE FUNCTION app.admin_institution_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select m.institution_id
  from public.institution_memberships m
  where m.user_id = auth.uid()
    and m.membership_role = 'institution_admin'
    and m.status = 'active'
    and m.deleted_at is null
    and m.left_institution_at is null
$$;

COMMENT ON FUNCTION app.admin_institution_ids() IS
  'Institution IDs where the caller is an active institution_admin. Use in RLS IN-subqueries.';

CREATE OR REPLACE FUNCTION app.member_institution_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select m.institution_id
  from public.institution_memberships m
  where m.user_id = auth.uid()
    and m.status = 'active'
    and m.deleted_at is null
    and m.left_institution_at is null
$$;

COMMENT ON FUNCTION app.member_institution_ids() IS
  'Institution IDs where the caller has any active membership. Use in RLS IN-subqueries.';

-- Scalar helpers: for RPC / application code.
CREATE OR REPLACE FUNCTION app.is_institution_admin(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1 from public.institution_memberships m
    where m.institution_id = p_institution_id
      and m.user_id = auth.uid()
      and m.membership_role = 'institution_admin'
      and m.status = 'active'
      and m.deleted_at is null
      and m.left_institution_at is null
  )
$$;

COMMENT ON FUNCTION app.is_institution_admin(uuid) IS
  'True when caller is an active institution_admin for the given institution.';

CREATE OR REPLACE FUNCTION app.is_institution_member(p_institution_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select exists (
    select 1 from public.institution_memberships m
    where m.institution_id = p_institution_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.deleted_at is null
      and m.left_institution_at is null
  )
$$;

COMMENT ON FUNCTION app.is_institution_member(uuid) IS
  'True when caller has any active membership in the given institution.';

CREATE OR REPLACE FUNCTION app.get_current_institution_id()
RETURNS uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select active_institution_id
  from public.profiles
  where user_id = auth.uid()
$$;

COMMENT ON FUNCTION app.get_current_institution_id() IS
  'Returns the caller''s active_institution_id from profiles.';

-- =============================================================================
-- 11c. APP HELPERS — classroom scoping (student_can_access_* in Phase B after ccl exists)
-- =============================================================================
CREATE OR REPLACE FUNCTION app.list_active_classroom_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  select cm.classroom_id
  from public.classroom_members cm
  where cm.user_id = auth.uid()
    and cm.withdrawn_at is null
$$;

COMMENT ON FUNCTION app.list_active_classroom_ids() IS
  'Classroom IDs where the caller has an active (non-withdrawn) classroom_members row. Does not list classrooms where the user is only classrooms.primary_teacher_id — the app must insert the primary teacher into classroom_members for consistent membership scoping.';

-- =============================================================================
-- 13b. Bootstrap — super_admin creates tenant + first institution_admin
--
-- Invite flow (app layer, GoTrue):
--   1) Create auth user + profile (e.g. auth.admin.inviteUserByEmail) — email lives in auth.users / profiles.
--   2) Super admin calls invite_institution_admin_membership(institution_id, user_id) OR bootstrap here with
--      p_initial_admin_status = 'invited'.
--   3) Invited users have no tenant access until status = active (app.member_institution_ids excludes non-active).
--   4) After the user completes invite / sets password, UI calls activate_institution_invite(institution_id)
--      (or legacy alias activate_institution_admin_invite — same behavior).
--   Teacher/student: institution_admin calls invite_institution_member(...); optional email-first rows in
--   institution_invites + redeem_institution_invite(token) when auth user did not exist yet.
-- =============================================================================
DROP FUNCTION IF EXISTS public.create_institution_with_initial_admin(text, uuid);

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

  INSERT INTO public.institutions (name)
  VALUES (btrim(p_name))
  RETURNING id INTO v_institution_id;

  INSERT INTO public.institution_memberships (
    user_id, institution_id, membership_role, status
  )
  VALUES (
    v_admin_id, v_institution_id, 'institution_admin'::membership_role, p_initial_admin_status
  );

  -- Legacy user_institutions row only once membership is active (invited users are not tenant members yet).
  IF p_initial_admin_status = 'active'::public.membership_status THEN
    INSERT INTO public.user_institutions (user_id, institution_id)
    VALUES (v_admin_id, v_institution_id)
    ON CONFLICT (user_id, institution_id) DO NOTHING;
  END IF;

  INSERT INTO public.institution_settings (institution_id)
  VALUES (v_institution_id);

  INSERT INTO public.institution_quotas_usage (institution_id)
  VALUES (v_institution_id);

  -- Default trial subscription when plan_catalog row code=trial exists (doc 14; seed in file 1).
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

REVOKE ALL ON FUNCTION public.create_institution_with_initial_admin(text, uuid, public.membership_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_institution_with_initial_admin(text, uuid, public.membership_status) TO authenticated;

COMMENT ON FUNCTION public.create_institution_with_initial_admin(text, uuid, public.membership_status) IS
  'Super admin only: creates institution, institution_admin membership (active or invited), legacy user_institutions only when active, settings, quotas, and trial subscription if plan trial exists.';

-- =============================================================================
-- 13c. Invite institution admin membership (super_admin only)
--      Pair with GoTrue inviteUserByEmail; no extra invite table required.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.invite_institution_admin_membership(
  p_institution_id uuid,
  p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (SELECT app.is_super_admin()) THEN
    RAISE EXCEPTION 'Forbidden: only super_admin may invite institution admins';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.institutions i WHERE i.id = p_institution_id AND i.deleted_at IS NULL) THEN
    RAISE EXCEPTION 'institution not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'profile not found for user; create auth user + profile first (e.g. GoTrue invite)';
  END IF;

  SELECT m.id INTO v_id
  FROM public.institution_memberships m
  WHERE m.user_id = p_user_id
    AND m.institution_id = p_institution_id
    AND m.deleted_at IS NULL;

  IF v_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM public.institution_memberships m
      WHERE m.id = v_id
        AND m.status = 'active'::public.membership_status
    ) THEN
      RAISE EXCEPTION 'user already has an active membership for this institution';
    END IF;

    UPDATE public.institution_memberships
    SET
      membership_role = 'institution_admin'::public.membership_role,
      status = 'invited'::public.membership_status,
      updated_at = now()
    WHERE id = v_id;

    RETURN v_id;
  END IF;

  INSERT INTO public.institution_memberships (
    user_id, institution_id, membership_role, status
  )
  VALUES (
    p_user_id,
    p_institution_id,
    'institution_admin'::public.membership_role,
    'invited'::public.membership_status
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.invite_institution_admin_membership(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invite_institution_admin_membership(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.invite_institution_admin_membership(uuid, uuid) IS
  'Super admin only: upserts institution_admin membership with status invited. Email/auth handled by GoTrue; profiles row must exist.';

-- =============================================================================
-- 13d. Invited user accepts — any membership_role (admin, teacher, student)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.activate_institution_invite(p_institution_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.institution_memberships m
  SET
    status = 'active'::public.membership_status,
    updated_at = now()
  WHERE m.user_id = v_uid
    AND m.institution_id = p_institution_id
    AND m.status = 'invited'::public.membership_status
    AND m.deleted_at IS NULL
    AND m.left_institution_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'no invited membership for this user and institution';
  END IF;

  INSERT INTO public.user_institutions (user_id, institution_id)
  VALUES (v_uid, p_institution_id)
  ON CONFLICT (user_id, institution_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_institution_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_institution_invite(uuid) TO authenticated;

COMMENT ON FUNCTION public.activate_institution_invite(uuid) IS
  'Caller: flips own invited row (any membership_role) to active and ensures legacy user_institutions. Use after GoTrue invite / password set.';

-- Backward-compatible alias (same implementation).
CREATE OR REPLACE FUNCTION public.activate_institution_admin_invite(p_institution_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  PERFORM public.activate_institution_invite(p_institution_id);
END;
$$;

REVOKE ALL ON FUNCTION public.activate_institution_admin_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_institution_admin_invite(uuid) TO authenticated;

COMMENT ON FUNCTION public.activate_institution_admin_invite(uuid) IS
  'Alias for activate_institution_invite (institution_admin and other roles).';

-- =============================================================================
-- 13e. Invite teacher/student — institution_admin or super_admin (profile must exist)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.invite_institution_member(
  p_institution_id uuid,
  p_user_id uuid,
  p_role public.membership_role
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_id         uuid;
  v_old_role   public.membership_role;
  v_old_status public.membership_status;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (
    (SELECT app.is_super_admin())
    OR (SELECT app.is_institution_admin(p_institution_id))
  ) THEN
    RAISE EXCEPTION 'Forbidden: only institution_admin for this tenant or super_admin may invite members';
  END IF;

  IF p_role NOT IN (
    'teacher'::public.membership_role,
    'student'::public.membership_role
  ) THEN
    RAISE EXCEPTION 'p_role must be teacher or student';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.institutions i WHERE i.id = p_institution_id AND i.deleted_at IS NULL) THEN
    RAISE EXCEPTION 'institution not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'profile not found for user; create auth user + profile first (e.g. GoTrue invite)';
  END IF;

  SELECT m.id, m.membership_role, m.status
  INTO v_id, v_old_role, v_old_status
  FROM public.institution_memberships m
  WHERE m.user_id = p_user_id
    AND m.institution_id = p_institution_id
    AND m.deleted_at IS NULL;

  IF v_id IS NOT NULL THEN
    IF v_old_role = 'institution_admin'::public.membership_role THEN
      RAISE EXCEPTION 'institution_admin membership is managed via super_admin invite only';
    END IF;

    IF v_old_status = 'active'::public.membership_status THEN
      RAISE EXCEPTION 'user already has an active membership for this institution';
    END IF;

    UPDATE public.institution_memberships
    SET
      membership_role = p_role,
      status = 'invited'::public.membership_status,
      updated_at = now()
    WHERE id = v_id;

    RETURN v_id;
  END IF;

  INSERT INTO public.institution_memberships (
    user_id, institution_id, membership_role, status
  )
  VALUES (
    p_user_id,
    p_institution_id,
    p_role,
    'invited'::public.membership_status
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.invite_institution_member(uuid, uuid, public.membership_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.invite_institution_member(uuid, uuid, public.membership_role) TO authenticated;

COMMENT ON FUNCTION public.invite_institution_member(uuid, uuid, public.membership_role) IS
  'Institution admin or super_admin: upserts teacher/student membership with status invited. Email/auth via GoTrue; profiles row must exist.';

-- =============================================================================
-- 13f. create_institution_invite_by_email
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
    'student'::public.membership_role
  ) THEN
    RAISE EXCEPTION 'p_role must be teacher or student';
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

REVOKE ALL ON FUNCTION public.create_institution_invite_by_email(uuid, text, public.membership_role, interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_institution_invite_by_email(uuid, text, public.membership_role, interval) TO authenticated;

COMMENT ON FUNCTION public.create_institution_invite_by_email(uuid, text, public.membership_role, interval) IS
  'Institution admin or super_admin: creates pending email invite; returns secret token for URL. Pair with GoTrue signup + redeem_institution_invite.';

-- =============================================================================
-- 13f. redeem_institution_invite
-- =============================================================================
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
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_institution_invite(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_institution_invite(uuid) TO authenticated;

COMMENT ON FUNCTION public.redeem_institution_invite(uuid) IS
  'Authenticated user: accepts email invite if profile email matches; creates or activates membership and user_institutions.';
