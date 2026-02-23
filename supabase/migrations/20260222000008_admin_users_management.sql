-- =============================================================================
-- ADMIN USERS MANAGEMENT (super_admin only)
-- - list users with institution counts
-- - permanently delete user from profiles and auth.users
-- =============================================================================

DROP FUNCTION IF EXISTS public.list_admin_users();
CREATE OR REPLACE FUNCTION public.list_admin_users()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  email text,
  username text,
  role text,
  avatar_url text,
  institution_count integer,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_id uuid;
  caller_is_super_admin boolean;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT p.is_super_admin
  INTO caller_is_super_admin
  FROM public.profiles p
  WHERE p.user_id = caller_id;

  IF COALESCE(caller_is_super_admin, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Forbidden: only super_admin can list users';
  END IF;

  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    p.email,
    p.username,
    p.role,
    p.avatar_url,
    COUNT(ui.institution_id)::integer AS institution_count,
    COALESCE((au.banned_until IS NULL OR au.banned_until <= NOW()), true) AS is_active
  FROM public.profiles p
  LEFT JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN public.user_institutions ui ON ui.user_id = p.user_id
  GROUP BY p.user_id, p.display_name, p.email, p.username, p.role, p.avatar_url, au.banned_until
  ORDER BY COALESCE(p.display_name, p.username, p.email, p.user_id::text) ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;

DROP FUNCTION IF EXISTS public.admin_delete_user(uuid, text);
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id uuid,
  expected_username text
)
RETURNS TABLE (
  deleted_user_id uuid,
  deleted_username text,
  deleted_storage_objects integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_id uuid;
  caller_is_super_admin boolean;
  target_username text;
  target_is_super_admin boolean;
  files_deleted integer := 0;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT p.is_super_admin
  INTO caller_is_super_admin
  FROM public.profiles p
  WHERE p.user_id = caller_id;

  IF COALESCE(caller_is_super_admin, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Forbidden: only super_admin can delete users';
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id is required';
  END IF;

  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  SELECT p.username, p.is_super_admin
  INTO target_username, target_is_super_admin
  FROM public.profiles p
  WHERE p.user_id = target_user_id;

  IF target_username IS NULL THEN
    RAISE EXCEPTION 'Target user not found or has no username';
  END IF;

  IF COALESCE(target_is_super_admin, false) IS TRUE THEN
    RAISE EXCEPTION 'Cannot delete another super_admin';
  END IF;

  IF expected_username IS DISTINCT FROM target_username THEN
    RAISE EXCEPTION 'Confirmation failed: username does not match';
  END IF;

  DELETE FROM public.profiles p
  WHERE p.user_id = target_user_id;

  DELETE FROM auth.users u
  WHERE u.id = target_user_id;

  RETURN QUERY SELECT target_user_id, target_username, files_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid, text) TO authenticated;

DROP FUNCTION IF EXISTS public.admin_set_user_active_status(uuid, boolean);
CREATE OR REPLACE FUNCTION public.admin_set_user_active_status(
  target_user_id uuid,
  set_active boolean
)
RETURNS TABLE (
  updated_user_id uuid,
  is_active boolean,
  banned_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage
AS $$
DECLARE
  caller_id uuid;
  caller_is_super_admin boolean;
  target_role text;
  target_is_super_admin boolean;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT p.is_super_admin
  INTO caller_is_super_admin
  FROM public.profiles p
  WHERE p.user_id = caller_id;

  IF COALESCE(caller_is_super_admin, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Forbidden: only super_admin can change account access';
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'target_user_id is required';
  END IF;

  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'You cannot deactivate your own account';
  END IF;

  SELECT p.role, p.is_super_admin
  INTO target_role, target_is_super_admin
  FROM public.profiles p
  WHERE p.user_id = target_user_id;

  IF target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  IF COALESCE(target_is_super_admin, false) IS TRUE THEN
    RAISE EXCEPTION 'Cannot change access for another super_admin';
  END IF;

  IF target_role NOT IN ('teacher', 'student', 'institution_admin') THEN
    RAISE EXCEPTION 'Only teacher, student, and institution_admin can be activated/deactivated';
  END IF;

  UPDATE auth.users u
  SET banned_until = CASE WHEN set_active THEN NULL ELSE (NOW() + INTERVAL '100 years') END
  WHERE u.id = target_user_id;

  RETURN QUERY
  SELECT
    u.id,
    (u.banned_until IS NULL OR u.banned_until <= NOW()) AS is_active,
    u.banned_until
  FROM auth.users u
  WHERE u.id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_active_status(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_active_status(uuid, boolean) TO authenticated;
