-- =============================================================================
-- CLASSROOM / COURSE LINKS / LESSON PROGRESS — RLS policies
-- Split from 20260323000002_classroom_course_links_lesson_progress.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- =============================================================================
-- classroom_course_links
-- =============================================================================
ALTER TABLE public.classroom_course_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_course_links FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ccl_super_admin ON public.classroom_course_links;
DROP POLICY IF EXISTS classroom_course_links_all_super_admin ON public.classroom_course_links;
CREATE POLICY classroom_course_links_all_super_admin ON public.classroom_course_links
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS ccl_institution_admin ON public.classroom_course_links;
DROP POLICY IF EXISTS classroom_course_links_all_institution_admin ON public.classroom_course_links;
CREATE POLICY classroom_course_links_all_institution_admin ON public.classroom_course_links
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

-- Teachers can manage links for classrooms they own, co-teach, or courses they authored.
DROP POLICY IF EXISTS ccl_teacher_manage ON public.classroom_course_links;
DROP POLICY IF EXISTS classroom_course_links_all_teacher ON public.classroom_course_links;
CREATE POLICY classroom_course_links_all_teacher ON public.classroom_course_links
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms cr
      WHERE cr.id = classroom_course_links.classroom_id
        AND cr.primary_teacher_id = (select app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = classroom_course_links.classroom_id
        AND cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = classroom_course_links.course_id
        AND c.teacher_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classrooms cr
      WHERE cr.id = classroom_course_links.classroom_id
        AND cr.primary_teacher_id = (select app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = classroom_course_links.classroom_id
        AND cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = classroom_course_links.course_id
        AND c.teacher_id = (select app.auth_uid())
    )
  );

-- Students (and co-teachers) discover links only for classrooms they belong to.
DROP POLICY IF EXISTS ccl_member_read ON public.classroom_course_links;
DROP POLICY IF EXISTS classroom_course_links_select_member ON public.classroom_course_links;
CREATE POLICY classroom_course_links_select_member ON public.classroom_course_links
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = classroom_course_links.classroom_id
        AND cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
    )
  );

-- =============================================================================
-- courses — replace Phase A policy with classroom-delivery-aware version
-- =============================================================================
DROP POLICY IF EXISTS courses_published_read ON public.courses;
DROP POLICY IF EXISTS courses_select_authenticated_published ON public.courses;
DROP POLICY IF EXISTS courses_select_member ON public.courses;
CREATE POLICY courses_select_member ON public.courses FOR SELECT TO authenticated USING (
  (select app.is_super_admin()) is true
  OR (
    is_published = true
    AND (
      institution_id IS NULL
      OR institution_id IN (select app.member_institution_ids())
    )
    AND (
      NOT (select app.caller_is_student_in(institution_id))
      OR (select app.student_can_access_course(id))
    )
  )
);

-- =============================================================================
-- lesson_progress
-- =============================================================================
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lp_super_admin ON public.lesson_progress;
DROP POLICY IF EXISTS lesson_progress_all_super_admin ON public.lesson_progress;
CREATE POLICY lesson_progress_all_super_admin ON public.lesson_progress
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Students manage their own progress for lessons they may access (enrollment or classroom delivery).
DROP POLICY IF EXISTS lp_own ON public.lesson_progress;
DROP POLICY IF EXISTS lesson_progress_all_own_student ON public.lesson_progress;
CREATE POLICY lesson_progress_all_own_student ON public.lesson_progress
  FOR ALL TO authenticated
  USING  (
    user_id = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
    AND (select app.student_can_access_lesson(lesson_id))
  )
  WITH CHECK (
    user_id = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
    AND (select app.student_can_access_lesson(lesson_id))
  );

-- Teachers can view progress for lessons in their courses.
DROP POLICY IF EXISTS lp_teacher_read ON public.lesson_progress;
DROP POLICY IF EXISTS lesson_progress_select_teacher ON public.lesson_progress;
CREATE POLICY lesson_progress_select_teacher ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.topics t ON l.topic_id = t.id
      JOIN public.courses c ON t.course_id = c.id
      WHERE c.teacher_id = (select app.auth_uid())
    )
  );

-- Institution admins can read progress in their institutions.
DROP POLICY IF EXISTS lp_institution_admin_read ON public.lesson_progress;
DROP POLICY IF EXISTS lesson_progress_select_institution_admin ON public.lesson_progress;
CREATE POLICY lesson_progress_select_institution_admin ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- =============================================================================
-- learning_events
-- =============================================================================
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS le_super_admin ON public.learning_events;
DROP POLICY IF EXISTS learning_events_all_super_admin ON public.learning_events;
CREATE POLICY learning_events_all_super_admin ON public.learning_events
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

-- Students insert their own events only for accessible lessons; course_id must match lesson.
DROP POLICY IF EXISTS le_student_insert ON public.learning_events;
DROP POLICY IF EXISTS learning_events_insert_student ON public.learning_events;
CREATE POLICY learning_events_insert_student ON public.learning_events
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select app.auth_uid())
    AND institution_id IN (select app.member_institution_ids())
    AND (select app.student_can_access_lesson(lesson_id))
    AND course_id = (
      SELECT c.id
      FROM public.lessons l
      JOIN public.topics t ON t.id = l.topic_id
      JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = learning_events.lesson_id
    )
  );

-- Students read their own events (for personal analytics / resume).
DROP POLICY IF EXISTS le_student_own_read ON public.learning_events;
DROP POLICY IF EXISTS learning_events_select_student_own ON public.learning_events;
CREATE POLICY learning_events_select_student_own ON public.learning_events
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

-- Teachers read events for lessons in their courses.
DROP POLICY IF EXISTS le_teacher_read ON public.learning_events;
DROP POLICY IF EXISTS learning_events_select_teacher ON public.learning_events;
CREATE POLICY learning_events_select_teacher ON public.learning_events
  FOR SELECT TO authenticated
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE teacher_id = (select app.auth_uid())
    )
  );

-- Institution admins read all events in their institutions.
DROP POLICY IF EXISTS le_institution_admin_read ON public.learning_events;
DROP POLICY IF EXISTS learning_events_select_institution_admin ON public.learning_events;
CREATE POLICY learning_events_select_institution_admin ON public.learning_events
  FOR SELECT TO authenticated
  USING (institution_id IN (select app.admin_institution_ids()));

-- =============================================================================
-- topics / lessons — add classroom delivery (Phase A policies)
-- =============================================================================
DROP POLICY IF EXISTS topics_enrolled_read ON public.topics;
DROP POLICY IF EXISTS topics_select_enrolled_student ON public.topics;
DROP POLICY IF EXISTS topics_select_member ON public.topics;
CREATE POLICY topics_select_member ON public.topics
  FOR SELECT TO authenticated
  USING (
    (select app.is_super_admin()) is true
    OR (select app.student_can_access_course(course_id))
  );

DROP POLICY IF EXISTS lessons_enrolled_read ON public.lessons;
DROP POLICY IF EXISTS lessons_select_enrolled_student ON public.lessons;
DROP POLICY IF EXISTS lessons_select_member ON public.lessons;
CREATE POLICY lessons_select_member ON public.lessons
  FOR SELECT TO authenticated
  USING (
    (select app.is_super_admin()) is true
    OR (select app.student_can_access_lesson(id))
  );
