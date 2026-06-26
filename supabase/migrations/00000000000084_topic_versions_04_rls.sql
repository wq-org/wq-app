-- =============================================================================
-- TOPIC VERSIONS — RLS
-- =============================================================================

ALTER TABLE public.topic_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_versions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS topic_versions_all_super_admin ON public.topic_versions;
CREATE POLICY topic_versions_all_super_admin ON public.topic_versions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS topic_versions_all_institution_admin ON public.topic_versions;
CREATE POLICY topic_versions_all_institution_admin ON public.topic_versions
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS topic_versions_select_course_teacher ON public.topic_versions;
CREATE POLICY topic_versions_select_course_teacher ON public.topic_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.topics t
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE t.id = topic_versions.topic_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS topic_versions_insert_course_teacher ON public.topic_versions;
CREATE POLICY topic_versions_insert_course_teacher ON public.topic_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    institution_id IN (SELECT app.member_institution_ids())
    AND EXISTS (
      SELECT 1
      FROM public.topics t
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE t.id = topic_versions.topic_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS topic_versions_update_course_teacher ON public.topic_versions;
CREATE POLICY topic_versions_update_course_teacher ON public.topic_versions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.topics t
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE t.id = topic_versions.topic_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.topics t
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE t.id = topic_versions.topic_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS topic_versions_delete_course_teacher ON public.topic_versions;
CREATE POLICY topic_versions_delete_course_teacher ON public.topic_versions
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.topics t
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE t.id = topic_versions.topic_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS topic_versions_select_student_delivery ON public.topic_versions;
CREATE POLICY topic_versions_select_student_delivery ON public.topic_versions
  FOR SELECT TO authenticated
  USING (
    institution_id IN (SELECT app.member_institution_ids())
    AND (
      EXISTS (
        SELECT 1
        FROM public.course_version_topics cvt
        INNER JOIN public.course_versions cv ON cv.id = cvt.course_version_id
        WHERE cvt.pinned_topic_version_id = topic_versions.id
          AND (SELECT app.student_can_access_course(cv.course_id))
      )
      OR EXISTS (
        SELECT 1
        FROM public.course_version_topics cvt
        INNER JOIN public.course_versions cv ON cv.id = cvt.course_version_id
        INNER JOIN public.course_deliveries cd
          ON cd.course_version_id = cv.id
         AND cd.course_id = cv.course_id
        INNER JOIN public.classroom_members cm
          ON cm.classroom_id = cd.classroom_id
         AND cm.user_id = (SELECT app.auth_uid())
         AND cm.withdrawn_at IS NULL
        INNER JOIN public.topic_versions pin ON pin.id = cvt.pinned_topic_version_id
        WHERE cvt.source_topic_id = topic_versions.topic_id
          AND cvt.resolution_mode = 'auto_patch'::public.topic_resolution_mode
          AND topic_versions.is_active = true
          AND topic_versions.change_kind IN (
            'editorial_patch'::public.topic_change_kind,
            'availability_patch'::public.topic_change_kind
          )
          AND pin.institution_id = topic_versions.institution_id
          AND pin.topic_id = topic_versions.topic_id
          AND pin.version_major = topic_versions.version_major
          AND cd.deleted_at IS NULL
          AND cd.published_at IS NOT NULL
          AND cd.status IN (
            'active'::public.course_delivery_status,
            'scheduled'::public.course_delivery_status
          )
          AND cd.institution_id IN (SELECT app.member_institution_ids())
      )
    )
  );

DROP POLICY IF EXISTS topic_versions_select_classroom_teacher ON public.topic_versions;
CREATE POLICY topic_versions_select_classroom_teacher ON public.topic_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.course_version_topics cvt
      INNER JOIN public.course_versions cv ON cv.id = cvt.course_version_id
      INNER JOIN public.course_deliveries cd ON cd.course_version_id = cv.id
      INNER JOIN public.classrooms cr ON cd.classroom_id = cr.id
      WHERE cvt.pinned_topic_version_id = topic_versions.id
        AND (
          cr.primary_teacher_id = (SELECT app.auth_uid())
          OR EXISTS (
            SELECT 1
            FROM public.classroom_members cm
            WHERE cm.classroom_id = cd.classroom_id
              AND cm.user_id = (SELECT app.auth_uid())
              AND cm.withdrawn_at IS NULL
              AND cm.membership_role = 'co_teacher'::public.classroom_member_role
          )
        )
    )
  );
