-- HETZNER_TEARDOWN: KEEP_CORE | WQ-MINIMAL-CORE | classroom-scoped student invite RPC + redeem enrollment | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- Classroom-scoped student invites
--
-- Teachers (primary or active co-teacher) can invite a student directly into
-- their own classroom. The invite is bound to the classroom via a new
-- classroom_id column on institution_invites; on redemption the user is
-- enrolled both as an active institution_membership AND as an active
-- classroom_members row for that classroom.
-- =============================================================================

-- 1. Add classroom binding column (nullable: existing institution-admin invites stay unscoped).
ALTER TABLE public.institution_invites
  ADD COLUMN IF NOT EXISTS classroom_id uuid REFERENCES public.classrooms (id) ON DELETE CASCADE;

COMMENT ON COLUMN public.institution_invites.classroom_id IS
  'Optional classroom the invitee is auto-enrolled into on redeem. Null = institution-only invite.';

CREATE INDEX IF NOT EXISTS idx_institution_invites_classroom_id
  ON public.institution_invites (classroom_id);

-- 2. RPC: teacher creates a classroom-scoped student invite.
CREATE OR REPLACE FUNCTION public.create_classroom_student_invite(
  p_classroom_id uuid,
  p_email        text,
  p_expires_in   interval DEFAULT '14 days'::interval
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid            uuid := auth.uid();
  v_institution_id uuid;
  v_is_teacher     boolean;
  v_email          text := lower(trim(p_email));
  v_token          uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'p_email is required';
  END IF;

  SELECT c.institution_id
    INTO v_institution_id
    FROM public.classrooms c
   WHERE c.id = p_classroom_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'classroom not found';
  END IF;

  -- Caller must be primary teacher OR active co-teacher in the classroom,
  -- OR an institution admin / super admin for the tenant.
  v_is_teacher := EXISTS (
    SELECT 1
      FROM public.classrooms c
     WHERE c.id = p_classroom_id
       AND c.primary_teacher_id = v_uid
  )
  OR EXISTS (
    SELECT 1
      FROM public.classroom_members cm
     WHERE cm.classroom_id = p_classroom_id
       AND cm.user_id = v_uid
       AND cm.membership_role = 'co_teacher'::public.classroom_member_role
       AND cm.withdrawn_at IS NULL
  )
  OR (SELECT app.is_institution_admin(v_institution_id))
  OR (SELECT app.is_super_admin());

  IF NOT v_is_teacher THEN
    RAISE EXCEPTION 'Forbidden: caller is not a teacher of this classroom';
  END IF;

  INSERT INTO public.institution_invites (
    institution_id,
    classroom_id,
    email,
    membership_role,
    expires_at,
    invited_by
  )
  VALUES (
    v_institution_id,
    p_classroom_id,
    v_email,
    'student'::public.membership_role,
    now() + p_expires_in,
    v_uid
  )
  RETURNING token INTO v_token;

  RETURN v_token;
END;
$$;

REVOKE ALL ON FUNCTION public.create_classroom_student_invite(uuid, text, interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_classroom_student_invite(uuid, text, interval) TO authenticated;

COMMENT ON FUNCTION public.create_classroom_student_invite(uuid, text, interval) IS
  'Teacher (primary/co) or admin: create a pending student invite bound to a classroom. Returns secret token for email URL.';

-- 3. Patch redeem_institution_invite to also enroll in classroom_members
--    when the invite carries a classroom_id.
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

  -- Classroom-scoped invite: also enroll into classroom_members.
  IF inv.classroom_id IS NOT NULL THEN
    INSERT INTO public.classroom_members (
      institution_id,
      classroom_id,
      user_id,
      membership_role
    )
    VALUES (
      inv.institution_id,
      inv.classroom_id,
      v_uid,
      'student'::public.classroom_member_role
    )
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.user_institutions (user_id, institution_id)
  VALUES (v_uid, inv.institution_id)
  ON CONFLICT (user_id, institution_id) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION public.redeem_institution_invite(uuid) IS
  'Authenticated user: accepts email invite if profile email matches; creates/activates membership and (when invite.classroom_id is set) inserts an active classroom_members row.';
