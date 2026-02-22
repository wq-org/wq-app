-- =============================================================================
-- BASELINE SCHEMA — Single migration for local and fresh deploys
-- Serious game MVP: profiles, institutions, courses, topics, lessons, games,
-- game_sessions, game_versions, media_files, teacher_followers, storage RLS.
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
  CREATE TYPE file_type AS ENUM ('image', 'pdf', 'video', 'audio', 'document');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE game_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM ('game', 'course', 'topic', 'lesson', 'profile');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE institution_type AS ENUM ('school', 'university', 'college', 'organization', 'other');
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
  address JSONB,
  status institution_status DEFAULT 'active',
  type institution_type,
  slug TEXT UNIQUE,
  website TEXT,
  social_links JSONB,
  created_by_admin_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  image_url TEXT
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
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- 9. MEDIA_FILES
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type file_type NOT NULL,
  file_size_bytes BIGINT,
  uploader_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  entity_type entity_type,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. GAMES
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  game_type game_type NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  topic_id UUID,
  game_config JSONB NOT NULL,
  status game_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  published_version INTEGER,
  is_draft BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ
);

-- 11. GAME_VERSIONS
CREATE TABLE IF NOT EXISTS public.game_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  game_config JSONB NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (game_id, version)
);

-- 12. GAME_SESSIONS
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  session_data JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  game_version INTEGER,
  current_node_id TEXT,
  progress_data JSONB
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
CREATE INDEX IF NOT EXISTS idx_game_sessions_student ON public.game_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game ON public.game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_media_files_entity ON public.media_files(entity_type, entity_id) WHERE (entity_type = 'game'::entity_type);

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

-- Game media: enforce file_path pattern and entity_id when entity_type = 'game'
CREATE OR REPLACE FUNCTION public.validate_game_media_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'game' THEN
    IF NEW.entity_id IS NULL THEN
      RAISE EXCEPTION 'entity_id cannot be null for game media';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.games WHERE id = NEW.entity_id) THEN
      RAISE EXCEPTION 'Game with id % does not exist', NEW.entity_id;
    END IF;
    IF NOT (NEW.file_path ~ ('^games/' || NEW.entity_id::text || '/.+')) THEN
      RAISE EXCEPTION 'Game media file_path must follow pattern: games/{game_id}/{filename}. Expected: games/%/{filename}, Got: %', NEW.entity_id, NEW.file_path;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_validate_game_media ON public.media_files;
CREATE TRIGGER trigger_validate_game_media
  BEFORE INSERT OR UPDATE ON public.media_files
  FOR EACH ROW EXECUTE FUNCTION public.validate_game_media_reference();

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
CREATE POLICY "Students can view published courses from followed teachers" ON public.courses FOR SELECT USING (
  is_published = true AND teacher_id IN (SELECT teacher_id FROM public.teacher_followers WHERE student_id = auth.uid())
);

-- =============================================================================
-- RLS — COURSE_ENROLLMENTS
-- =============================================================================
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their enrollments" ON public.course_enrollments;
CREATE POLICY "Students can manage their enrollments" ON public.course_enrollments FOR ALL USING (auth.uid() = student_id);
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
-- RLS — MEDIA_FILES
-- =============================================================================
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their uploaded files" ON public.media_files;
CREATE POLICY "Users can manage their uploaded files" ON public.media_files FOR ALL USING (auth.uid() = uploader_id);

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
-- RLS — GAME_SESSIONS
-- =============================================================================
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can manage their game sessions" ON public.game_sessions;
CREATE POLICY "Students can manage their game sessions" ON public.game_sessions FOR ALL USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Teachers can view sessions for their games" ON public.game_sessions;
CREATE POLICY "Teachers can view sessions for their games" ON public.game_sessions FOR SELECT USING (
  game_id IN (SELECT id FROM public.games WHERE teacher_id = auth.uid())
);

-- =============================================================================
-- RLS — GAME_VERSIONS
-- =============================================================================
ALTER TABLE public.game_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view their game versions" ON public.game_versions;
CREATE POLICY "Teachers can view their game versions" ON public.game_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "Teachers can create versions for their games" ON public.game_versions;
CREATE POLICY "Teachers can create versions for their games" ON public.game_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "Teachers can update their game versions" ON public.game_versions;
CREATE POLICY "Teachers can update their game versions" ON public.game_versions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "Teachers can delete their game versions" ON public.game_versions;
CREATE POLICY "Teachers can delete their game versions" ON public.game_versions FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.games WHERE games.id = game_versions.game_id AND games.teacher_id = auth.uid())
);

-- =============================================================================
-- STORAGE — buckets + RLS (path: {role}/{user_id}/filename for files)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', false), ('avatars', 'avatars', false), ('backgrounds', 'backgrounds', false)
ON CONFLICT (id) DO NOTHING;

-- RLS on storage.objects is already enabled by Supabase; we only add policies here.

DROP POLICY IF EXISTS "Allow authenticated uploads to files" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'files'
  AND (storage.foldername(name))[1] IN ('teacher', 'student', 'institution_admin', 'super_admin')
  AND (storage.foldername(name))[2] = auth.uid()::text
);

DROP POLICY IF EXISTS "Allow authenticated read files" ON storage.objects;
CREATE POLICY "Allow authenticated read files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'files');
DROP POLICY IF EXISTS "Allow authenticated read own files" ON storage.objects;
CREATE POLICY "Allow authenticated read own files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'files'
  AND (storage.foldername(name))[1] IN ('teacher', 'student', 'institution_admin', 'super_admin')
  AND (storage.foldername(name))[2] = auth.uid()::text
);
DROP POLICY IF EXISTS "Teachers upload to own folder" ON storage.objects;
CREATE POLICY "Teachers upload to own folder" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'files' AND (storage.foldername(name))[1] = 'teacher' AND (storage.foldername(name))[2] = auth.uid()::text
);
DROP POLICY IF EXISTS "Teachers read own files" ON storage.objects;
CREATE POLICY "Teachers read own files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = 'teacher' AND (storage.foldername(name))[2] = auth.uid()::text);
DROP POLICY IF EXISTS "Teachers update own files" ON storage.objects;
CREATE POLICY "Teachers update own files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = 'teacher' AND (storage.foldername(name))[2] = auth.uid()::text);
DROP POLICY IF EXISTS "Teachers delete own files" ON storage.objects;
CREATE POLICY "Teachers delete own files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'files' AND (storage.foldername(name))[1] = 'teacher' AND (storage.foldername(name))[2] = auth.uid()::text);
DROP POLICY IF EXISTS "authenticated_read_avatars_bucket" ON storage.objects;
CREATE POLICY "authenticated_read_avatars_bucket" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars');
