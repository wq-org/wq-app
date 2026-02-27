-- Return profiles that share at least one institution with the current user.
DROP FUNCTION IF EXISTS public.list_searchable_profiles_in_my_institutions();

CREATE OR REPLACE FUNCTION public.list_searchable_profiles_in_my_institutions()
RETURNS TABLE (
  user_id uuid,
  username text,
  display_name text,
  email text,
  avatar_url text,
  role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    p.user_id,
    p.username,
    p.display_name,
    p.email,
    p.avatar_url,
    p.role
  FROM public.profiles AS p
  INNER JOIN public.user_institutions AS ui_target
    ON ui_target.user_id = p.user_id
  INNER JOIN public.user_institutions AS ui_me
    ON ui_me.institution_id = ui_target.institution_id
  WHERE ui_me.user_id = auth.uid()
    AND p.role IN ('student', 'teacher', 'institution_admin', 'super_admin')
  ORDER BY p.display_name NULLS LAST, p.username NULLS LAST, p.email NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.list_searchable_profiles_in_my_institutions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_searchable_profiles_in_my_institutions() TO authenticated;
