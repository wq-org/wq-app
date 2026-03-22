-- =============================================================================
-- PHASE A — Retarget LMS + storage RLS to institution_memberships
--
-- Doc map:
--   03_Teacher / 04_Student → RLS rules on shared LMS tables via memberships
--   db_guide_line_en.md → FORCE RLS, institution_id tenant checks
--   multitenant plan follow-up → user_institutions → institution_memberships
--
-- Replaces all baseline + Feb policies that used user_institutions or
-- profiles.role-only checks. Preserves super_admin bypass from 20260209000002.
--
-- Enrollment / delivery (Variant A): course content for students is delivered via
-- classroom_course_links + classroom_members (Phase B). No student self-service
-- on course_enrollments. Students see published courses only when student_can_access_course
-- (narrow courses_published_read for profiles.role = student).
-- teacher_followers is social only; does not gate LMS access.
--
-- Games: optional games.course_id (one game → one course); legacy games.topic_id
-- removed after backfill; trigger games_enforce_course_institution_match enforces tenant alignment.
--
-- courses.institution_id NULL handling: new INSERT requires NOT NULL via
-- application code; existing NULL rows are visible to their owning teacher
-- only. A backfill should set institution_id from the teacher's primary
-- institution once your app flow supports it.
--
-- Requires: 20260321000001, 20260321000002 (institution_memberships + app.*)
-- =============================================================================

-- =============================================================================
-- 1a. ADD institution_id to games (marketplace-ready; consistent with courses)
-- =============================================================================
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS institution_id uuid
    REFERENCES public.institutions(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.games.institution_id IS 'Owning institution. Nullable for legacy rows; new inserts should always set this.';

CREATE INDEX IF NOT EXISTS idx_games_institution
  ON public.games (institution_id) WHERE institution_id IS NOT NULL;

-- Backfill from teacher's primary active membership.
UPDATE public.games g
SET institution_id = (
  SELECT m.institution_id
  FROM public.institution_memberships m
  WHERE m.user_id = g.teacher_id
    AND m.status = 'active'
    AND m.deleted_at IS NULL
    AND m.left_institution_at IS NULL
  ORDER BY m.created_at ASC
  LIMIT 1
)
WHERE g.institution_id IS NULL;

-- =============================================================================
-- 1a2. Games → optional course link (one game, one course); drop legacy topic_id
--       Tenant safety: trigger enforces games.institution_id matches courses.institution_id.
-- =============================================================================
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS course_id uuid;

COMMENT ON COLUMN public.games.course_id IS
  'Optional course placement; NULL = standalone. When set, institution_id must match courses.institution_id (enforced by trigger).';

-- Carry topic-based linkage forward as course placement before dropping topic_id.
UPDATE public.games g
SET course_id = t.course_id
FROM public.topics t
WHERE g.topic_id IS NOT NULL
  AND t.id = g.topic_id;

-- Align institution_id with the linked course (fixes cross-tenant mismatch before FK/trigger).
UPDATE public.games g
SET institution_id = c.institution_id
FROM public.courses c
WHERE g.course_id = c.id
  AND (g.institution_id IS DISTINCT FROM c.institution_id);

DROP INDEX IF EXISTS idx_games_topic;

ALTER TABLE public.games DROP COLUMN IF EXISTS topic_id;

CREATE INDEX IF NOT EXISTS idx_games_course
  ON public.games (course_id) WHERE course_id IS NOT NULL;

ALTER TABLE public.games
  DROP CONSTRAINT IF EXISTS games_course_id_fkey;

ALTER TABLE public.games
  ADD CONSTRAINT games_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.games_enforce_course_institution_match()
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

COMMENT ON FUNCTION public.games_enforce_course_institution_match() IS
  'Ensures games cannot reference a course from another institution (NULL matches NULL).';

DROP TRIGGER IF EXISTS games_course_institution_trg ON public.games;
CREATE TRIGGER games_course_institution_trg
  BEFORE INSERT OR UPDATE OF course_id, institution_id ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.games_enforce_course_institution_match();

-- =============================================================================
-- 1b. FORCE RLS on baseline tables that only had ENABLE
-- =============================================================================
ALTER TABLE public.profiles             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_institutions    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_followers    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.courses              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.topics               FORCE ROW LEVEL SECURITY;
ALTER TABLE public.lessons              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.games                FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. STORAGE — cloud bucket: user_institutions → institution_memberships
-- =============================================================================
DROP POLICY IF EXISTS "Users upload to own institution folder" ON storage.objects;
CREATE POLICY "Users upload to own institution folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND (storage.foldername(name))[1]::uuid IN (select app.member_institution_ids())
  AND (storage.foldername(name))[2] IN ('teacher', 'student', 'institution_admin', 'super_admin')
  AND (storage.foldername(name))[3] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users read files from own institution" ON storage.objects;
CREATE POLICY "Users read files from own institution" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND (storage.foldername(name))[1]::uuid IN (select app.member_institution_ids())
);

DROP POLICY IF EXISTS "Users manage own files" ON storage.objects;
CREATE POLICY "Users manage own files" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND (storage.foldername(name))[1]::uuid IN (select app.member_institution_ids())
  AND (storage.foldername(name))[3] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'cloud'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND (storage.foldername(name))[1]::uuid IN (select app.member_institution_ids())
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- =============================================================================
-- 3. TEACHER_FOLLOWERS — same-institution via institution_memberships
-- =============================================================================
DROP POLICY IF EXISTS "Anyone can view teacher followers" ON public.teacher_followers;
DROP POLICY IF EXISTS "Select own follow relations" ON public.teacher_followers;
DROP POLICY IF EXISTS "Students can manage who they follow" ON public.teacher_followers;
DROP POLICY IF EXISTS "Students follow teachers same institution" ON public.teacher_followers;
DROP POLICY IF EXISTS "Students unfollow teachers" ON public.teacher_followers;
DROP POLICY IF EXISTS "Students view own follows" ON public.teacher_followers;
DROP POLICY IF EXISTS "Teachers can see their followers" ON public.teacher_followers;

CREATE POLICY tf_super_admin ON public.teacher_followers
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY tf_own_read ON public.teacher_followers
  FOR SELECT TO authenticated
  USING (student_id = (select app.auth_uid()) OR teacher_id = (select app.auth_uid()));

CREATE POLICY tf_student_insert ON public.teacher_followers
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (select app.auth_uid())
    AND EXISTS (
      SELECT 1
      FROM public.institution_memberships ms
      JOIN public.institution_memberships mt
        ON ms.institution_id = mt.institution_id
      WHERE ms.user_id = (select app.auth_uid())
        AND mt.user_id = teacher_followers.teacher_id
        AND ms.status = 'active' AND ms.deleted_at IS NULL
        AND ms.left_institution_at IS NULL
        AND mt.status = 'active' AND mt.deleted_at IS NULL
        AND mt.left_institution_at IS NULL
    )
  );

CREATE POLICY tf_student_delete ON public.teacher_followers
  FOR DELETE TO authenticated
  USING (student_id = (select app.auth_uid()));

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

REVOKE ALL ON FUNCTION public.list_searchable_profiles_in_my_institutions() FROM PUBLIC;
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

REVOKE ALL ON FUNCTION public.list_admin_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admin_users() TO authenticated;

-- =============================================================================
-- 7. COURSES — membership-based RLS
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage own courses" ON public.courses;
CREATE POLICY courses_manage ON public.courses FOR ALL TO authenticated USING (
  (select app.is_super_admin()) is true
  OR teacher_id = (select app.auth_uid())
);

DROP POLICY IF EXISTS "Authenticated users can view published courses" ON public.courses;
-- Broad catalog here; Phase B replaces this policy after student_can_access_course exists.
CREATE POLICY courses_published_read ON public.courses FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR (
    is_published = true
    AND (
      institution_id IS NULL
      OR institution_id IN (select app.member_institution_ids())
    )
  )
);

-- =============================================================================
-- 8. COURSE_ENROLLMENTS — institution-based enrollment
-- =============================================================================
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
CREATE POLICY ce_own_read ON public.course_enrollments FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR student_id = (select app.auth_uid())
);

DROP POLICY IF EXISTS "Students can join followed teacher published courses" ON public.course_enrollments;
DROP POLICY IF EXISTS ce_student_insert ON public.course_enrollments;

DROP POLICY IF EXISTS "Students can leave own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS ce_student_delete ON public.course_enrollments;

-- Optional legacy/analytics rows; only super_admin mutates from client (service role bypasses RLS).
CREATE POLICY ce_super_admin ON public.course_enrollments
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS "Teachers can see enrollments for their courses" ON public.course_enrollments;
CREATE POLICY ce_teacher_read ON public.course_enrollments FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = (select app.auth_uid()))
);

-- Institution admin can see enrollments in their institutions' courses.
CREATE POLICY ce_institution_admin_read ON public.course_enrollments FOR SELECT TO authenticated USING (
  course_id IN (
    SELECT c.id FROM public.courses c
    WHERE c.institution_id IN (select app.admin_institution_ids())
  )
);

-- =============================================================================
-- 9. TOPICS — preserve super_admin bypass, add institution admin read
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage topics in their courses" ON public.topics;
CREATE POLICY topics_manage ON public.topics FOR ALL TO authenticated USING (
  (select app.is_super_admin()) is true
  OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = (select app.auth_uid()))
);

DROP POLICY IF EXISTS "Students can view topics in enrolled courses" ON public.topics;
CREATE POLICY topics_enrolled_read ON public.topics FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR course_id IN (SELECT course_id FROM public.course_enrollments WHERE student_id = (select app.auth_uid()))
);

CREATE POLICY topics_institution_admin_read ON public.topics FOR SELECT TO authenticated USING (
  course_id IN (
    SELECT c.id FROM public.courses c
    WHERE c.institution_id IN (select app.admin_institution_ids())
  )
);

-- =============================================================================
-- 10. LESSONS — same pattern
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage lessons in their topics" ON public.lessons;
CREATE POLICY lessons_manage ON public.lessons FOR ALL TO authenticated USING (
  (select app.is_super_admin()) is true
  OR topic_id IN (
    SELECT t.id FROM public.topics t
    JOIN public.courses c ON t.course_id = c.id
    WHERE c.teacher_id = (select app.auth_uid())
  )
);

DROP POLICY IF EXISTS "Students can view lessons in enrolled courses" ON public.lessons;
CREATE POLICY lessons_enrolled_read ON public.lessons FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR topic_id IN (
    SELECT t.id FROM public.topics t
    JOIN public.courses c ON t.course_id = c.id
    JOIN public.course_enrollments ce ON c.id = ce.course_id
    WHERE ce.student_id = (select app.auth_uid())
  )
);

-- =============================================================================
-- 11. GAMES — institution_id based visibility (same pattern as courses)
-- =============================================================================
DROP POLICY IF EXISTS "Teachers can manage their games" ON public.games;
CREATE POLICY games_manage ON public.games FOR ALL TO authenticated USING (
  (select app.is_super_admin()) is true
  OR teacher_id = (select app.auth_uid())
);

DROP POLICY IF EXISTS "Students can read published games of followed teachers" ON public.games;
CREATE POLICY games_published_read ON public.games FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR (
    status = 'published'
    AND (
      institution_id IS NULL
      OR institution_id IN (select app.member_institution_ids())
    )
  )
);

-- Institution admins can read all games in their institutions.
CREATE POLICY games_institution_admin_read ON public.games FOR SELECT TO authenticated USING (
  institution_id IN (select app.admin_institution_ids())
);
