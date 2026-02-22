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
CREATE POLICY "Students can view published courses from followed teachers" ON public.courses FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR (is_published = true AND teacher_id IN (SELECT teacher_id FROM public.teacher_followers WHERE student_id = auth.uid()))
);

-- =============================================================================
-- COURSE_ENROLLMENTS: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Students can manage their enrollments" ON public.course_enrollments;
CREATE POLICY "Students can manage their enrollments" ON public.course_enrollments FOR ALL USING (
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
-- GAME_SESSIONS: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Students can manage their game sessions" ON public.game_sessions;
CREATE POLICY "Students can manage their game sessions" ON public.game_sessions FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR auth.uid() = student_id
);

DROP POLICY IF EXISTS "Teachers can view sessions for their games" ON public.game_sessions;
CREATE POLICY "Teachers can view sessions for their games" ON public.game_sessions FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR game_id IN (SELECT id FROM public.games WHERE teacher_id = auth.uid())
);

-- =============================================================================
-- GAME_VERSIONS: add SuperAdmin bypass
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can view their game versions" ON public.game_versions;
CREATE POLICY "Teachers can view their game versions" ON public.game_versions FOR SELECT USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers can create versions for their games" ON public.game_versions;
CREATE POLICY "Teachers can create versions for their games" ON public.game_versions FOR INSERT WITH CHECK (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers can update their game versions" ON public.game_versions;
CREATE POLICY "Teachers can update their game versions" ON public.game_versions FOR UPDATE USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers can delete their game versions" ON public.game_versions;
CREATE POLICY "Teachers can delete their game versions" ON public.game_versions FOR DELETE USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);

-- =============================================================================
-- MEDIA_FILES: add SuperAdmin bypass (can manage any row)
-- =============================================================================
DROP POLICY IF EXISTS "Users can manage their uploaded files" ON public.media_files;
CREATE POLICY "Users can manage their uploaded files" ON public.media_files FOR ALL USING (
  (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid()) = TRUE
  OR auth.uid() = uploader_id
);



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
