-- Step 1: Add super_admin flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin
ON public.profiles(is_super_admin)
WHERE is_super_admin = TRUE;

-- Step 3: Promote first SuperAdmin (run after signup; optionally set is_onboarded = TRUE)
UPDATE public.profiles
SET
  is_super_admin = TRUE,
  role = 'super_admin',
  is_onboarded = TRUE
WHERE email = 'admin@wq-app.de';

-- Pattern: SuperAdmin bypass uses (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
-- Always use profiles.user_id (not id); no institution_id on profiles (use user_institutions if needed).

-- =============================================================================
-- INSTITUTIONS: SuperAdmin can manage (view already allowed for everyone in baseline)
-- =============================================================================
DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
CREATE POLICY "Admins and SuperAdmin can manage institutions" ON public.institutions
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND (role = 'admin' OR is_super_admin = TRUE))
);

-- =============================================================================
-- COURSES: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage own courses" ON public.courses;
CREATE POLICY "Teachers can manage own courses" ON public.courses FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "Students can view published courses from followed teachers" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view published courses" ON public.courses;
CREATE POLICY "Authenticated users can view published courses" ON public.courses FOR SELECT TO authenticated USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR (
    is_published = true
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role IN ('student', 'teacher', 'institution_admin')
    )
  )
);

-- =============================================================================
-- COURSE_ENROLLMENTS: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Students can manage their enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
CREATE POLICY "Students can view own enrollments" ON public.course_enrollments FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR auth.uid() = student_id
);
DROP POLICY IF EXISTS "Students can join followed teacher published courses" ON public.course_enrollments;
CREATE POLICY "Students can join followed teacher published courses" ON public.course_enrollments FOR INSERT WITH CHECK (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR (
    auth.uid() = student_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'student'
    )
    AND EXISTS (
      SELECT 1
      FROM public.courses c
      JOIN public.teacher_followers tf ON tf.teacher_id = c.teacher_id
      WHERE c.id = course_enrollments.course_id
        AND c.is_published = true
        AND tf.student_id = auth.uid()
    )
  )
);
DROP POLICY IF EXISTS "Students can leave own enrollments" ON public.course_enrollments;
CREATE POLICY "Students can leave own enrollments" ON public.course_enrollments FOR DELETE USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR auth.uid() = student_id
);

DROP POLICY IF EXISTS "Teachers can see enrollments for their courses" ON public.course_enrollments;
CREATE POLICY "Teachers can see enrollments for their courses" ON public.course_enrollments FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
);

-- =============================================================================
-- TOPICS: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage topics in their courses" ON public.topics;
CREATE POLICY "Teachers can manage topics in their courses" ON public.topics FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Students can view topics in enrolled courses" ON public.topics;
CREATE POLICY "Students can view topics in enrolled courses" ON public.topics FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR course_id IN (SELECT course_id FROM public.course_enrollments WHERE student_id = auth.uid())
);

-- =============================================================================
-- LESSONS: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage lessons in their topics" ON public.lessons;
CREATE POLICY "Teachers can manage lessons in their topics" ON public.lessons FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR topic_id IN (SELECT t.id FROM public.topics t JOIN public.courses c ON t.course_id = c.id WHERE c.teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Students can view lessons in enrolled courses" ON public.lessons;
CREATE POLICY "Students can view lessons in enrolled courses" ON public.lessons FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR topic_id IN (
    SELECT t.id FROM public.topics t
    JOIN public.courses c ON t.course_id = c.id
    JOIN public.course_enrollments ce ON c.id = ce.course_id
    WHERE ce.student_id = auth.uid()
  )
);

-- =============================================================================
-- GAMES: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage their games" ON public.games;
CREATE POLICY "Teachers can manage their games" ON public.games FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR auth.uid() = teacher_id
);

DROP POLICY IF EXISTS "Students can read published games of followed teachers" ON public.games;
CREATE POLICY "Students can read published games of followed teachers" ON public.games FOR SELECT TO authenticated USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.teacher_followers tf
      WHERE tf.teacher_id = games.teacher_id AND tf.student_id = auth.uid()
    )
  )
);

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

-- =============================================================================
-- SEED: Create SuperAdmin User (Local Dev/Testing Only)
-- =============================================================================

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if SuperAdmin already exists
  SELECT user_id INTO admin_user_id
  FROM public.profiles
  WHERE email = 'admin@wq-app.de'
  LIMIT 1;

  -- Only create if doesn't exist
  IF admin_user_id IS NULL THEN
    -- Step 1: Create auth.users entry
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@wq-app.de',
      crypt('wq-app', gen_salt('bf')), -- CHANGE THIS PASSWORD!
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"username":"admin","display_name":"Super Administrator"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;

    -- Step 2: Create profile (assuming your trigger doesn't auto-create it)
    INSERT INTO public.profiles (
      user_id,
      email,
      username,
      display_name,
      role,
      is_super_admin,
      is_onboarded,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      'admin@wq-app.de',
      'admin',
      'Super Administrator',
      'super_admin',
      TRUE,
      TRUE,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      is_super_admin = TRUE,
      role = 'super_admin',
      is_onboarded = TRUE;

    RAISE NOTICE 'SuperAdmin created: admin@wq-app.de (Password: **********)';
  ELSE
    RAISE NOTICE 'SuperAdmin already exists with user_id: %', admin_user_id;
  END IF;
END $$;
