-- =============================================================================
-- COURSE DELIVERY — RLS for version + delivery tables; tighten progress/events
-- Requires: 20260329000006_course_delivery_06_functions_rpcs.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- course_versions
-- -----------------------------------------------------------------------------
ALTER TABLE public.course_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_versions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_versions_all_super_admin ON public.course_versions;
CREATE POLICY course_versions_all_super_admin ON public.course_versions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS course_versions_all_institution_admin ON public.course_versions;
CREATE POLICY course_versions_all_institution_admin ON public.course_versions
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS course_versions_all_course_teacher ON public.course_versions;
CREATE POLICY course_versions_all_course_teacher ON public.course_versions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_versions.course_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_versions.course_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS course_versions_select_student_delivery ON public.course_versions;
CREATE POLICY course_versions_select_student_delivery ON public.course_versions
  FOR SELECT TO authenticated
  USING ((SELECT app.student_can_access_course(course_id)) IS TRUE);

DROP POLICY IF EXISTS course_versions_select_classroom_teacher ON public.course_versions;
CREATE POLICY course_versions_select_classroom_teacher ON public.course_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_deliveries cd
      INNER JOIN public.classrooms cr ON cd.classroom_id = cr.id
      WHERE cd.course_version_id = course_versions.id
        AND (
          cr.primary_teacher_id = (SELECT app.auth_uid())
          OR EXISTS (
            SELECT 1 FROM public.classroom_members cm
            WHERE cm.classroom_id = cd.classroom_id
              AND cm.user_id = (SELECT app.auth_uid())
              AND cm.withdrawn_at IS NULL
              AND cm.membership_role = 'co_teacher'::public.classroom_member_role
          )
        )
    )
  );

-- -----------------------------------------------------------------------------
-- course_version_topics
-- -----------------------------------------------------------------------------
ALTER TABLE public.course_version_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_version_topics FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_version_topics_all_super_admin ON public.course_version_topics;
CREATE POLICY course_version_topics_all_super_admin ON public.course_version_topics
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS course_version_topics_all_institution_admin ON public.course_version_topics;
CREATE POLICY course_version_topics_all_institution_admin ON public.course_version_topics
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      WHERE cv.id = course_version_topics.course_version_id
        AND cv.institution_id IN (SELECT app.admin_institution_ids())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      WHERE cv.id = course_version_topics.course_version_id
        AND cv.institution_id IN (SELECT app.admin_institution_ids())
    )
  );

DROP POLICY IF EXISTS course_version_topics_all_course_teacher ON public.course_version_topics;
CREATE POLICY course_version_topics_all_course_teacher ON public.course_version_topics
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      INNER JOIN public.courses c ON cv.course_id = c.id
      WHERE cv.id = course_version_topics.course_version_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      INNER JOIN public.courses c ON cv.course_id = c.id
      WHERE cv.id = course_version_topics.course_version_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS course_version_topics_select_student_delivery ON public.course_version_topics;
CREATE POLICY course_version_topics_select_student_delivery ON public.course_version_topics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      WHERE cv.id = course_version_topics.course_version_id
        AND (SELECT app.student_can_access_course(cv.course_id)) IS TRUE
    )
  );

DROP POLICY IF EXISTS course_version_topics_select_classroom_teacher ON public.course_version_topics;
CREATE POLICY course_version_topics_select_classroom_teacher ON public.course_version_topics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_versions cv
      INNER JOIN public.course_deliveries cd ON cv.id = cd.course_version_id
      INNER JOIN public.classrooms cr ON cd.classroom_id = cr.id
      WHERE cv.id = course_version_topics.course_version_id
        AND (
          cr.primary_teacher_id = (SELECT app.auth_uid())
          OR EXISTS (
            SELECT 1 FROM public.classroom_members cm
            WHERE cm.classroom_id = cd.classroom_id
              AND cm.user_id = (SELECT app.auth_uid())
              AND cm.withdrawn_at IS NULL
              AND cm.membership_role = 'co_teacher'::public.classroom_member_role
          )
        )
    )
  );

-- -----------------------------------------------------------------------------
-- course_version_lessons
-- -----------------------------------------------------------------------------
ALTER TABLE public.course_version_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_version_lessons FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_version_lessons_all_super_admin ON public.course_version_lessons;
CREATE POLICY course_version_lessons_all_super_admin ON public.course_version_lessons
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS course_version_lessons_all_institution_admin ON public.course_version_lessons;
CREATE POLICY course_version_lessons_all_institution_admin ON public.course_version_lessons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_version_topics cvt
      INNER JOIN public.course_versions cv ON cvt.course_version_id = cv.id
      WHERE cvt.id = course_version_lessons.course_version_topic_id
        AND cv.institution_id IN (SELECT app.admin_institution_ids())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.course_version_topics cvt
      INNER JOIN public.course_versions cv ON cvt.course_version_id = cv.id
      WHERE cvt.id = course_version_lessons.course_version_topic_id
        AND cv.institution_id IN (SELECT app.admin_institution_ids())
    )
  );

DROP POLICY IF EXISTS course_version_lessons_all_course_teacher ON public.course_version_lessons;
CREATE POLICY course_version_lessons_all_course_teacher ON public.course_version_lessons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_version_topics cvt
      INNER JOIN public.course_versions cv ON cvt.course_version_id = cv.id
      INNER JOIN public.courses c ON cv.course_id = c.id
      WHERE cvt.id = course_version_lessons.course_version_topic_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.course_version_topics cvt
      INNER JOIN public.course_versions cv ON cvt.course_version_id = cv.id
      INNER JOIN public.courses c ON cv.course_id = c.id
      WHERE cvt.id = course_version_lessons.course_version_topic_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS course_version_lessons_select_student_delivery ON public.course_version_lessons;
CREATE POLICY course_version_lessons_select_student_delivery ON public.course_version_lessons
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_version_topics cvt
      INNER JOIN public.course_versions cv ON cvt.course_version_id = cv.id
      WHERE cvt.id = course_version_lessons.course_version_topic_id
        AND (SELECT app.student_can_access_course(cv.course_id)) IS TRUE
    )
  );

DROP POLICY IF EXISTS course_version_lessons_select_classroom_teacher ON public.course_version_lessons;
CREATE POLICY course_version_lessons_select_classroom_teacher ON public.course_version_lessons
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_version_topics cvt
      INNER JOIN public.course_versions cv ON cvt.course_version_id = cv.id
      INNER JOIN public.course_deliveries cd ON cv.id = cd.course_version_id
      INNER JOIN public.classrooms cr ON cd.classroom_id = cr.id
      WHERE cvt.id = course_version_lessons.course_version_topic_id
        AND (
          cr.primary_teacher_id = (SELECT app.auth_uid())
          OR EXISTS (
            SELECT 1 FROM public.classroom_members cm
            WHERE cm.classroom_id = cd.classroom_id
              AND cm.user_id = (SELECT app.auth_uid())
              AND cm.withdrawn_at IS NULL
              AND cm.membership_role = 'co_teacher'::public.classroom_member_role
          )
        )
    )
  );

-- -----------------------------------------------------------------------------
-- course_deliveries
-- -----------------------------------------------------------------------------
ALTER TABLE public.course_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_deliveries FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_deliveries_all_super_admin ON public.course_deliveries;
CREATE POLICY course_deliveries_all_super_admin ON public.course_deliveries
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS course_deliveries_all_institution_admin ON public.course_deliveries;
CREATE POLICY course_deliveries_all_institution_admin ON public.course_deliveries
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS course_deliveries_all_teacher ON public.course_deliveries;
CREATE POLICY course_deliveries_all_teacher ON public.course_deliveries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms cr
      WHERE cr.id = course_deliveries.classroom_id
        AND cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = course_deliveries.classroom_id
        AND cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_deliveries.course_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classrooms cr
      WHERE cr.id = course_deliveries.classroom_id
        AND cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = course_deliveries.classroom_id
        AND cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_deliveries.course_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS course_deliveries_select_classroom_member ON public.course_deliveries;
CREATE POLICY course_deliveries_select_classroom_member ON public.course_deliveries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_members cm
      WHERE cm.classroom_id = course_deliveries.classroom_id
        AND cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
    )
  );

-- -----------------------------------------------------------------------------
-- lesson_progress — delivery + snapshot membership
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS lesson_progress_all_own_student ON public.lesson_progress;
CREATE POLICY lesson_progress_all_own_student ON public.lesson_progress
  FOR ALL TO authenticated
  USING (
    user_id = (SELECT app.auth_uid())
    AND institution_id IN (SELECT app.member_institution_ids())
    AND (SELECT app.student_can_access_course_delivery(course_delivery_id))
    AND (SELECT app.lesson_in_course_delivery_version(lesson_id, course_delivery_id))
  )
  WITH CHECK (
    user_id = (SELECT app.auth_uid())
    AND institution_id IN (SELECT app.member_institution_ids())
    AND (SELECT app.student_can_access_course_delivery(course_delivery_id))
    AND (SELECT app.lesson_in_course_delivery_version(lesson_id, course_delivery_id))
  );

-- -----------------------------------------------------------------------------
-- learning_events — delivery + snapshot membership
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS learning_events_insert_student ON public.learning_events;
CREATE POLICY learning_events_insert_student ON public.learning_events
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT app.auth_uid())
    AND institution_id IN (SELECT app.member_institution_ids())
    AND (SELECT app.student_can_access_course_delivery(course_delivery_id))
    AND (SELECT app.lesson_in_course_delivery_version(lesson_id, course_delivery_id))
    AND course_id = (
      SELECT cd.course_id
      FROM public.course_deliveries cd
      WHERE cd.id = learning_events.course_delivery_id
    )
    AND course_id = (
      SELECT c.id
      FROM public.lessons l
      INNER JOIN public.topics t ON l.topic_id = t.id
      INNER JOIN public.courses c ON t.course_id = c.id
      WHERE l.id = learning_events.lesson_id
    )
  );