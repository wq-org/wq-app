-- =============================================================================
-- LESSON VERSIONS — 07_rls_policies
-- Row-level security for public.lesson_versions.
-- docs/architecture/db_principles.md: ENABLE + FORCE RLS; institution_id scoping;
-- wrap stable JWT helpers in scalar subqueries where applicable.
-- =============================================================================

ALTER TABLE public.lesson_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_versions FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- Super admin: all access (read + write)
-- =============================================================================

DROP POLICY IF EXISTS lesson_versions_all_super_admin ON public.lesson_versions;
CREATE POLICY lesson_versions_all_super_admin ON public.lesson_versions
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE);

-- =============================================================================
-- Institution admin: all access within institution
-- =============================================================================

DROP POLICY IF EXISTS lesson_versions_all_institution_admin ON public.lesson_versions;
CREATE POLICY lesson_versions_all_institution_admin ON public.lesson_versions
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

-- =============================================================================
-- Teacher: insert (publish) lessons in own courses
-- =============================================================================

DROP POLICY IF EXISTS lesson_versions_insert_teacher ON public.lesson_versions;
CREATE POLICY lesson_versions_insert_teacher ON public.lesson_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    institution_id IN (SELECT app.member_institution_ids())
    AND (SELECT app.teacher_can_manage_lesson(lesson_id))
  );

-- =============================================================================
-- Teacher: select published versions of own lessons
-- =============================================================================

DROP POLICY IF EXISTS lesson_versions_select_teacher ON public.lesson_versions;
CREATE POLICY lesson_versions_select_teacher ON public.lesson_versions
  FOR SELECT TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR institution_id IN (SELECT app.admin_institution_ids())
    OR (SELECT app.teacher_can_manage_lesson(lesson_id))
  );

-- =============================================================================
-- Student: select versions they access via course delivery
-- =============================================================================

DROP POLICY IF EXISTS lesson_versions_select_student_via_delivery ON public.lesson_versions;
CREATE POLICY lesson_versions_select_student_via_delivery ON public.lesson_versions
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT DISTINCT cvl.source_lesson_version_id
      FROM public.course_version_lessons cvl
      JOIN public.course_version_topics cvt ON cvt.id = cvl.course_version_topic_id
      JOIN public.course_versions cv ON cv.id = cvt.course_version_id
      JOIN public.course_deliveries cd ON cd.course_version_id = cv.id
      WHERE cvl.source_lesson_version_id IS NOT NULL
        AND (SELECT app.student_can_access_course_delivery(cd.id))
    )
  );

-- =============================================================================
-- RLS Safety Notes:
-- - Institution_id is indexed for filter performance (see 03_indexes)
-- - Teacher policy uses app.teacher_can_manage_lesson() (SECURITY DEFINER helper)
-- - Student policy is read-only and scoped to lesson versions in accessible deliveries
-- - Pre-implementation checklist (db_principles.md): avoid policy/helper recursion
-- =============================================================================
