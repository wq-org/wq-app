-- =============================================================================
-- BASELINE SCHEMA — Single migration for local and fresh deploys
-- Serious game MVP: profiles, institutions, courses, topics, lessons, games,
-- and teacher_followers + storage RLS.
-- After this, use new migrations only for schema changes.
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ BEGIN
  CREATE TYPE game_type AS ENUM ('flow', 'image_term_match', 'image_marker', 'line_picker', 'custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE game_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE institution_type AS ENUM (
    'school',
    'university',
    'college',
    'organization',
    'hospital',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE institution_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- TABLES (order respects FKs)
-- =============================================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  role TEXT,
  two_fa_enabled BOOLEAN,
  two_fa_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  linkedin_url TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  follow_count INTEGER DEFAULT 0,
  is_onboarded BOOLEAN DEFAULT false,
  display_name TEXT,
  description TEXT,
  PRIMARY KEY (user_id)
);

-- 2. INSTITUTIONS
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  email TEXT,
  image_url TEXT,
  phone TEXT,
  legal_name TEXT,
  legal_form TEXT,
  registration_number TEXT,
  tax_id TEXT,
  vat_id TEXT,
  billing_email TEXT,
  billing_contact_name TEXT,
  billing_contact_phone TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  primary_contact_role TEXT,
  invoice_language TEXT DEFAULT 'de' CHECK (invoice_language IN ('de', 'en', 'es', 'fr', 'sv')),
  payment_terms INTEGER DEFAULT 30 CHECK (payment_terms > 0),
  address JSONB,
  institution_number TEXT,
  number_of_beds INTEGER CHECK (number_of_beds >= 0),
  departments TEXT[],
  accreditation TEXT,
  status institution_status DEFAULT 'active',
  type institution_type,
  slug TEXT UNIQUE,
  website TEXT,
  social_links JSONB,
  created_by_admin_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER_INSTITUTIONS
CREATE TABLE IF NOT EXISTS public.user_institutions (
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, institution_id)
);

-- 4. TEACHER_FOLLOWERS
CREATE TABLE IF NOT EXISTS public.teacher_followers (
  teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (teacher_id, student_id),
  CHECK (teacher_id != student_id)
);

-- 5. COURSES
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  theme_id TEXT NOT NULL DEFAULT 'blue',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COURSE_ENROLLMENTS
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (course_id, student_id)
);

-- 7. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LESSONS
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- Idempotent when baseline is re-applied against an older lessons table (no pages column).
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS pages JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 9. GAMES
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  game_type game_type NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  topic_id UUID,
  theme_id TEXT NOT NULL DEFAULT 'blue',
  game_config JSONB NOT NULL,
  status game_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  published_version INTEGER,
  is_draft BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ
);

-- Idempotent for DBs created before theme_id existed (folded from 20260227000001_add_theme_id_to_courses_and_games.sql).
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS theme_id TEXT NOT NULL DEFAULT 'blue';

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS theme_id TEXT NOT NULL DEFAULT 'blue';

-- theme_id CHECK constraints (folded from 20260227000001_add_theme_id_to_courses_and_games.sql).
ALTER TABLE public.courses
DROP CONSTRAINT IF EXISTS courses_theme_id_check;

ALTER TABLE public.courses
ADD CONSTRAINT courses_theme_id_check
CHECK (theme_id IN ('violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'orange', 'pink', 'darkblue'));

ALTER TABLE public.games
DROP CONSTRAINT IF EXISTS games_theme_id_check;

ALTER TABLE public.games
ADD CONSTRAINT games_theme_id_check
CHECK (theme_id IN ('violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'orange', 'pink', 'darkblue'));

-- =============================================================================
-- LESSON PAGES — backfill from legacy single `content` column
-- Folded from: 20260317000001_add_lesson_pages.sql,
--              20260317000002_repair_lesson_pages_backfill.sql
-- =============================================================================
UPDATE public.lessons
SET pages = jsonb_build_array(
  jsonb_build_object(
    'id', uuid_generate_v4()::text,
    'order', 0,
    'content', content
  )
)
WHERE jsonb_typeof(pages) IS DISTINCT FROM 'array'
   OR (
     jsonb_typeof(pages) = 'array'
     AND (
       jsonb_array_length(pages) = 0
       OR jsonb_typeof(pages -> 0) IS DISTINCT FROM 'object'
       OR NOT ((pages -> 0) ? 'content')
       OR pages -> 0 -> 'content' IS NULL
       OR pages -> 0 -> 'content' = 'null'::jsonb
     )
   );

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_institutions_slug ON public.institutions(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON public.courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_topics_course ON public.topics(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic ON public.lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_games_teacher ON public.games(teacher_id);
CREATE INDEX IF NOT EXISTS idx_games_topic ON public.games(topic_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS institutions_updated_at ON public.institutions;
CREATE TRIGGER institutions_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS topics_updated_at ON public.topics;
CREATE TRIGGER topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS lessons_updated_at ON public.lessons;
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
DROP TRIGGER IF EXISTS games_updated_at ON public.games;
CREATE TRIGGER games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- follow_count when teacher_followers change (profiles uses user_id)
CREATE OR REPLACE FUNCTION public.update_teacher_follow_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET follow_count = COALESCE(follow_count, 0) + 1 WHERE user_id = NEW.teacher_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET follow_count = GREATEST(COALESCE(follow_count, 0) - 1, 0) WHERE user_id = OLD.teacher_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS teacher_followers_count ON public.teacher_followers;
CREATE TRIGGER teacher_followers_count
  AFTER INSERT OR DELETE ON public.teacher_followers
  FOR EACH ROW EXECUTE FUNCTION public.update_teacher_follow_count();

-- Auth: create profile on signup
-- IMPORTANT: do NOT trust `raw_user_meta_data->>'role'` for privileged roles.
-- Clients can set signup metadata. We allow only a safe subset and default to 'student'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
  safe_role TEXT;
BEGIN
  requested_role := lower(trim(coalesce(NEW.raw_user_meta_data->>'role', '')));

  -- Allowlist only non-privileged roles here.
  -- If you need admin/institution_admin/super_admin, assign those server-side via an invite flow.
  safe_role := CASE
    WHEN requested_role IN ('student', 'teacher') THEN requested_role
    ELSE 'student'
  END;

  INSERT INTO public.profiles (user_id, email, role, is_onboarded)
  VALUES (
    NEW.id,
    NEW.email,
    safe_role,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Follow teacher (RLS applies; same-institution enforced by policy)
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
  INSERT INTO public.teacher_followers (teacher_id, student_id)
  VALUES (target_teacher_id, auth.uid())
  ON CONFLICT (teacher_id, student_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.follow_teacher(uuid) TO authenticated;
COMMENT ON FUNCTION public.follow_teacher(uuid) IS 'Follow a teacher (same institution). Unfollow via direct DELETE.';

-- Same-institution profile search for command palette (folded from 20260226000001_command_search_same_institution.sql).
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

-- =============================================================================
-- RLS — PROFILES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public profile info" ON public.profiles;
CREATE POLICY "Users can view public profile info" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS — INSTITUTIONS
-- =============================================================================
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view institutions" ON public.institutions;
CREATE POLICY "Everyone can view institutions" ON public.institutions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
CREATE POLICY "Admins can manage institutions" ON public.institutions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- =============================================================================
-- RLS — USER_INSTITUTIONS
-- =============================================================================
ALTER TABLE public.user_institutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their institution relationships" ON public.user_institutions;
CREATE POLICY "Users can view their institution relationships" ON public.user_institutions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage their institution relationships" ON public.user_institutions;
CREATE POLICY "Users can manage their institution relationships" ON public.user_institutions FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- RLS — TEACHER_FOLLOWERS
-- =============================================================================
ALTER TABLE public.teacher_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view teacher followers" ON public.teacher_followers;
CREATE POLICY "Anyone can view teacher followers" ON public.teacher_followers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Select own follow relations" ON public.teacher_followers;
CREATE POLICY "Select own follow relations" ON public.teacher_followers FOR SELECT USING (student_id = auth.uid() OR teacher_id = auth.uid());
DROP POLICY IF EXISTS "Students can manage who they follow" ON public.teacher_followers;
CREATE POLICY "Students can manage who they follow" ON public.teacher_followers FOR ALL USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students follow teachers same institution" ON public.teacher_followers;
CREATE POLICY "Students follow teachers same institution" ON public.teacher_followers FOR INSERT WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.user_institutions ui_s
    JOIN public.user_institutions ui_t ON ui_s.institution_id = ui_t.institution_id
    WHERE ui_s.user_id = auth.uid() AND ui_t.user_id = teacher_id
  )
);
DROP POLICY IF EXISTS "Students unfollow teachers" ON public.teacher_followers;
CREATE POLICY "Students unfollow teachers" ON public.teacher_followers FOR DELETE USING (student_id = auth.uid());
DROP POLICY IF EXISTS "Students view own follows" ON public.teacher_followers;
CREATE POLICY "Students view own follows" ON public.teacher_followers FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Teachers can see their followers" ON public.teacher_followers;
CREATE POLICY "Teachers can see their followers" ON public.teacher_followers FOR SELECT USING (auth.uid() = teacher_id);

-- =============================================================================
-- RLS — COURSES
-- =============================================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage own courses" ON public.courses;
CREATE POLICY "Teachers can manage own courses" ON public.courses FOR ALL USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "Students can view published courses from followed teachers" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view published courses" ON public.courses;
CREATE POLICY "Authenticated users can view published courses" ON public.courses FOR SELECT TO authenticated USING (
  is_published = true
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('student', 'teacher', 'institution_admin')
  )
);

-- =============================================================================
-- RLS — COURSE_ENROLLMENTS
-- =============================================================================
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
CREATE POLICY "Students can view own enrollments" ON public.course_enrollments FOR SELECT USING (
  auth.uid() = student_id
);
DROP POLICY IF EXISTS "Students can join followed teacher published courses" ON public.course_enrollments;
CREATE POLICY "Students can join followed teacher published courses" ON public.course_enrollments FOR INSERT WITH CHECK (
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
);
DROP POLICY IF EXISTS "Students can leave own enrollments" ON public.course_enrollments;
CREATE POLICY "Students can leave own enrollments" ON public.course_enrollments FOR DELETE USING (
  auth.uid() = student_id
);
DROP POLICY IF EXISTS "Teachers can see enrollments for their courses" ON public.course_enrollments;
CREATE POLICY "Teachers can see enrollments for their courses" ON public.course_enrollments FOR SELECT USING (
  course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
);

-- =============================================================================
-- RLS — TOPICS
-- =============================================================================
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage topics in their courses" ON public.topics;
CREATE POLICY "Teachers can manage topics in their courses" ON public.topics FOR ALL USING (
  course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "Students can view topics in enrolled courses" ON public.topics;
CREATE POLICY "Students can view topics in enrolled courses" ON public.topics FOR SELECT USING (
  course_id IN (SELECT course_id FROM public.course_enrollments WHERE student_id = auth.uid())
);

-- =============================================================================
-- RLS — LESSONS
-- =============================================================================
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage lessons in their topics" ON public.lessons;
CREATE POLICY "Teachers can manage lessons in their topics" ON public.lessons FOR ALL USING (
  topic_id IN (SELECT t.id FROM public.topics t JOIN public.courses c ON t.course_id = c.id WHERE c.teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "Students can view lessons in enrolled courses" ON public.lessons;
CREATE POLICY "Students can view lessons in enrolled courses" ON public.lessons FOR SELECT USING (
  topic_id IN (
    SELECT t.id FROM public.topics t
    JOIN public.courses c ON t.course_id = c.id
    JOIN public.course_enrollments ce ON c.id = ce.course_id
    WHERE ce.student_id = auth.uid()
  )
);

-- =============================================================================
-- RLS — GAMES
-- =============================================================================
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage their games" ON public.games;
CREATE POLICY "Teachers can manage their games" ON public.games FOR ALL USING (auth.uid() = teacher_id);
DROP POLICY IF EXISTS "Students can read published games of followed teachers" ON public.games;
CREATE POLICY "Students can read published games of followed teachers" ON public.games FOR SELECT TO authenticated USING (
  status = 'published'
  AND EXISTS (
    SELECT 1 FROM public.teacher_followers tf
    WHERE tf.teacher_id = games.teacher_id AND tf.student_id = auth.uid()
  )
);

-- =============================================================================
-- STORAGE — buckets + RLS (path: {institution_id}/{role}/{user_id}/filename)
-- Folded from 20260312000001_storage_bucket_files_to_cloud.sql (migration removed).
-- Canonical app bucket is `cloud` (replaces legacy `files` bucket name in app code).
-- NOTE: Supabase blocks direct DELETE from storage.objects in SQL migrations;
-- moving objects from `files` → `cloud` must be done via Storage API (service role).
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cloud', 'cloud', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false), ('backgrounds', 'backgrounds', false)
ON CONFLICT (id) DO NOTHING;

-- RLS on storage.objects is already enabled by Supabase; we only add policies here.

DROP POLICY IF EXISTS "Allow authenticated uploads to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Teachers read own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers update own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users upload to own institution folder" ON storage.objects;
DROP POLICY IF EXISTS "Users read files from own institution" ON storage.objects;
DROP POLICY IF EXISTS "Users manage own files" ON storage.objects;

-- 1. Authenticated users can upload to their own institution folder
CREATE POLICY "Users upload to own institution folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.user_institutions ui
    WHERE ui.user_id = auth.uid()
      AND ui.institution_id::text = (storage.foldername(name))[1]
  )
  AND (storage.foldername(name))[2] IN ('teacher', 'student', 'institution_admin', 'super_admin')
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- 2. Users can read files from their institution
CREATE POLICY "Users read files from own institution" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.user_institutions ui
    WHERE ui.user_id = auth.uid()
      AND ui.institution_id::text = (storage.foldername(name))[1]
  )
);

-- 3. Users can read/write only their own files
CREATE POLICY "Users manage own files" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.user_institutions ui
    WHERE ui.user_id = auth.uid()
      AND ui.institution_id::text = (storage.foldername(name))[1]
  )
  AND (storage.foldername(name))[3] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.user_institutions ui
    WHERE ui.user_id = auth.uid()
      AND ui.institution_id::text = (storage.foldername(name))[1]
  )
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- 4. Authenticated avatars bucket read (keep existing)
DROP POLICY IF EXISTS "authenticated_read_avatars_bucket" ON storage.objects;
CREATE POLICY "authenticated_read_avatars_bucket" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
