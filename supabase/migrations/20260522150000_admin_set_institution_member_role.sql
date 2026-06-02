-- Super-admin: set profiles.role and active institution_memberships.membership_role for a member.

DROP FUNCTION IF EXISTS public.admin_set_institution_member_role(uuid, uuid, text);

CREATE OR REPLACE FUNCTION public.admin_set_institution_member_role(
  p_institution_id uuid,
  p_user_id uuid,
  p_new_role text
)
RETURNS TABLE (
  updated_user_id uuid,
  previous_role text,
  new_role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id uuid;
  v_target_role text;
  v_target_is_super_admin boolean;
  v_previous_role text;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT (SELECT app.is_super_admin()) THEN
    RAISE EXCEPTION 'Forbidden: only super_admin can change institution member roles';
  END IF;

  IF p_institution_id IS NULL OR p_user_id IS NULL THEN
    RAISE EXCEPTION 'institution_id and user_id are required';
  END IF;

  IF p_new_role NOT IN ('institution_admin', 'teacher', 'student') THEN
    RAISE EXCEPTION 'new_role must be institution_admin, teacher, or student';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.institution_memberships m
    WHERE m.institution_id = p_institution_id
      AND m.user_id = p_user_id
      AND m.deleted_at IS NULL
      AND m.status = 'active'
  ) THEN
    RAISE EXCEPTION 'No active membership for this user at the institution';
  END IF;

  SELECT p.role, p.is_super_admin
  INTO v_target_role, v_target_is_super_admin
  FROM public.profiles p
  WHERE p.user_id = p_user_id;

  IF v_target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  IF COALESCE(v_target_is_super_admin, false) IS TRUE OR v_target_role = 'super_admin' THEN
    RAISE EXCEPTION 'Cannot change role for a super_admin user';
  END IF;

  v_previous_role := v_target_role;

  UPDATE public.profiles p
  SET role = p_new_role,
      updated_at = now()
  WHERE p.user_id = p_user_id
    AND p.role IS DISTINCT FROM p_new_role;

  UPDATE public.institution_memberships m
  SET membership_role = p_new_role,
      updated_at = now()
  WHERE m.institution_id = p_institution_id
    AND m.user_id = p_user_id
    AND m.deleted_at IS NULL
    AND m.status = 'active'
    AND m.membership_role IS DISTINCT FROM p_new_role;

  RETURN QUERY
  SELECT p_user_id, v_previous_role, p_new_role;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_institution_member_role(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_institution_member_role(uuid, uuid, text) TO authenticated;

COMMENT ON FUNCTION public.admin_set_institution_member_role(uuid, uuid, text) IS
  'Super-admin: updates profiles.role and active institution_memberships.membership_role for a user at an institution.';
