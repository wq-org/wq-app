-- =============================================================================
-- PHASE A — LMS + storage RLS retarget: RLS policies
-- Split from 20260323000001_baseline_lms_rls_memberships.sql
-- Requires: 20260321000001_super_admin (all parts), 20260321000002_institution_admin (all parts)
-- =============================================================================

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
