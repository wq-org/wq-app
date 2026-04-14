-- =============================================================================
-- PHASE A — LMS + storage RLS retarget: functions & RPCs
-- Split from 20260323000001_baseline_lms_rls_memberships.sql
-- Requires: 20260321000001_super_admin (all parts), 20260321000002_institution_admin (all parts)
-- =============================================================================

-- =============================================================================
-- Trigger function: enforce_games_course_institution_match
-- =============================================================================
DROP FUNCTION IF EXISTS public.games_enforce_course_institution_match();
CREATE OR REPLACE FUNCTION public.enforce_games_course_institution_match()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.course_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = NEW.course_id
        AND c.institution_id IS NOT DISTINCT FROM NEW.institution_id
    ) THEN
      RAISE EXCEPTION 'games.institution_id must match courses.institution_id when course_id is set';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.enforce_games_course_institution_match() IS
  'Ensures games cannot reference a course from another institution (NULL matches NULL).';

-- =============================================================================
-- 4. follow_teacher RPC — switch to institution_memberships
-- =============================================================================
DROP FUNCTION IF EXISTS public.follow_teacher(uuid);
CREATE OR REPLACE FUNCTION public.follow_teacher(target_teacher_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF auth.uid() = target_teacher_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.institution_memberships ms
    JOIN public.institution_memberships mt
      ON ms.institution_id = mt.institution_id
    WHERE ms.user_id = auth.uid()
      AND mt.user_id = target_teacher_id
      AND ms.status = 'active' AND ms.deleted_at IS NULL
      AND mt.status = 'active' AND mt.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Teacher is not in any of your institutions';
  END IF;
  INSERT INTO public.teacher_followers (teacher_id, student_id)
  VALUES (target_teacher_id, auth.uid())
  ON CONFLICT (teacher_id, student_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.follow_teacher(uuid) TO authenticated;

COMMENT ON FUNCTION public.follow_teacher(uuid) IS 'Follow a teacher (same institution via institution_memberships).';

-- =============================================================================
-- 5. list_searchable_profiles_in_my_institutions — use institution_memberships
-- =============================================================================
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
  INNER JOIN public.institution_memberships AS m_target
    ON m_target.user_id = p.user_id
    AND m_target.status = 'active'
    AND m_target.deleted_at IS NULL
    AND m_target.left_institution_at IS NULL
  INNER JOIN public.institution_memberships AS m_me
    ON m_me.institution_id = m_target.institution_id
    AND m_me.status = 'active'
    AND m_me.deleted_at IS NULL
    AND m_me.left_institution_at IS NULL
  WHERE m_me.user_id = auth.uid()
    AND p.role IN ('student', 'teacher', 'institution_admin', 'super_admin')
  ORDER BY p.display_name NULLS LAST, p.username NULLS LAST, p.email NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.list_searchable_profiles_in_my_institutions() FROM public;
GRANT EXECUTE ON FUNCTION public.list_searchable_profiles_in_my_institutions() TO authenticated;

-- =============================================================================
-- 6. list_admin_users — use institution_memberships instead of user_institutions
-- =============================================================================
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
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT (SELECT app.is_super_admin()) THEN
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
    COUNT(m.institution_id)::integer AS institution_count,
    COALESCE((au.banned_until IS NULL OR au.banned_until <= NOW()), true) AS is_active
  FROM public.profiles p
  LEFT JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN public.institution_memberships m
    ON m.user_id = p.user_id AND m.status = 'active' AND m.deleted_at IS NULL
    AND m.left_institution_at IS NULL
  GROUP BY p.user_id, p.display_name, p.email, p.username, p.role, p.avatar_url, au.banned_until
  ORDER BY COALESCE(p.display_name, p.username, p.email, p.user_id::text) ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.list_admin_users() FROM public;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;
