-- =============================================================================
-- LESSON BLOCKS — RLS policies
-- Requires: 20260508120000_lesson_blocks_01_tables.sql
-- =============================================================================
-- Tenant boundary: lesson_blocks.institution_id is set by BEFORE INSERT trigger
-- (never trust client). Registry is platform-global lookup; visible to any
-- authenticated member, writable only by super admin.
-- =============================================================================

ALTER TABLE public.lesson_block_type_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_block_type_registry FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lesson_block_type_registry_select_authenticated ON public.lesson_block_type_registry;
DROP POLICY IF EXISTS lesson_block_type_registry_select_member ON public.lesson_block_type_registry;
CREATE POLICY lesson_block_type_registry_select_member ON public.lesson_block_type_registry
  FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS lesson_block_type_registry_all_super_admin ON public.lesson_block_type_registry;
CREATE POLICY lesson_block_type_registry_all_super_admin ON public.lesson_block_type_registry
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

ALTER TABLE public.lesson_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_blocks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lesson_blocks_all_super_admin ON public.lesson_blocks;
CREATE POLICY lesson_blocks_all_super_admin ON public.lesson_blocks
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS lesson_blocks_all_institution_admin ON public.lesson_blocks;
CREATE POLICY lesson_blocks_all_institution_admin ON public.lesson_blocks
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS lesson_blocks_select_lesson_scope ON public.lesson_blocks;
CREATE POLICY lesson_blocks_select_lesson_scope ON public.lesson_blocks
  FOR SELECT TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR institution_id IN (SELECT app.admin_institution_ids())
    OR EXISTS (
      SELECT 1
      FROM public.lessons l
      INNER JOIN public.topics t ON t.id = l.topic_id
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = lesson_blocks.lesson_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
    OR (SELECT app.student_can_access_lesson(lesson_blocks.lesson_id))
  );

DROP POLICY IF EXISTS lesson_blocks_insert_teacher ON public.lesson_blocks;
CREATE POLICY lesson_blocks_insert_teacher ON public.lesson_blocks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      INNER JOIN public.topics t ON t.id = l.topic_id
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = lesson_blocks.lesson_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS lesson_blocks_update_teacher ON public.lesson_blocks;
CREATE POLICY lesson_blocks_update_teacher ON public.lesson_blocks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      INNER JOIN public.topics t ON t.id = l.topic_id
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = lesson_blocks.lesson_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      INNER JOIN public.topics t ON t.id = l.topic_id
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = lesson_blocks.lesson_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );

DROP POLICY IF EXISTS lesson_blocks_delete_teacher ON public.lesson_blocks;
CREATE POLICY lesson_blocks_delete_teacher ON public.lesson_blocks
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      INNER JOIN public.topics t ON t.id = l.topic_id
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = lesson_blocks.lesson_id
        AND c.teacher_id = (SELECT app.auth_uid())
    )
  );
