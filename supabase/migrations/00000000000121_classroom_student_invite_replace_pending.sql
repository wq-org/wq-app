-- HETZNER_TEARDOWN: KEEP_CORE | WQ-MINIMAL-CORE | make classroom student invites idempotent for pending email rows
-- =============================================================================
-- Classroom-scoped student invites share the pending invite uniqueness rule:
-- one pending invite per institution + email. Re-inviting the same email from a
-- classroom should replace the pending invite instead of surfacing a 23505.
-- =============================================================================

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

  DELETE FROM public.institution_invites
  WHERE institution_id = v_institution_id
    AND lower(trim(email)) = v_email
    AND accepted_at IS NULL;

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
  'Teacher (primary/co) or admin: replace any pending invite for this institution/email, create a classroom-scoped student invite, and return the secret token for email URL.';
