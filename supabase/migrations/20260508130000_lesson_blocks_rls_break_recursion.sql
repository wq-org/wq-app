-- =============================================================================
-- Break RLS recursion between public.lesson_blocks and public.lessons / topics /
-- public.courses. Each lesson_blocks INSERT/UPDATE/DELETE re-entered
-- lessons → topics → courses RLS, compounding lessons_select_member
-- (app.student_can_access_lesson) per row. With the new editor's
-- per-block UPDATE flow in syncLessonBlocksForLesson, this caused
-- statement_timeout (57014) on autosave.
--
-- Pattern: SECURITY DEFINER + SET search_path = '' + SET row_security = off,
-- scoped strictly by p_lesson_id and (SELECT auth.uid()). Same recipe as
-- 20260424120000_classrooms_rls_break_recursion.sql and
-- 20260504000000_games_rls_break_recursion_with_game_versions.sql.
-- See docs/architecture/principle_database.md (Pre-implementation checklist —
-- RLS recursion and helper traps).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5. Functions / RPC
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app.teacher_can_manage_lesson(p_lesson_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.lessons lesson_row
    INNER JOIN public.topics topic_row ON topic_row.id = lesson_row.topic_id
    INNER JOIN public.courses course_row ON course_row.id = topic_row.course_id
    WHERE lesson_row.id = p_lesson_id
      AND course_row.teacher_id = (SELECT auth.uid())
  );
$$;

COMMENT ON FUNCTION app.teacher_can_manage_lesson(uuid) IS
  'True when caller owns the course that contains the lesson via topic. '
  'SECURITY DEFINER with row_security off only for this scan to break the '
  'lesson_blocks ↔ lessons RLS recursion that caused statement_timeout (57014) '
  'on per-row autosave updates. Scoped strictly by p_lesson_id + (SELECT auth.uid()).';

GRANT EXECUTE ON FUNCTION app.teacher_can_manage_lesson(uuid) TO authenticated;

-- Harden the existing tenant-key trigger function: pin search_path and
-- bypass RLS only for the bounded read (lessons → topics → courses by
-- NEW.lesson_id). Avoids relying on owner BYPASSRLS for INSERT correctness.
CREATE OR REPLACE FUNCTION public.lesson_blocks_before_insert_set_institution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
  v_institution_id uuid;
BEGIN
  SELECT course_row.institution_id INTO v_institution_id
  FROM public.lessons lesson_row
  INNER JOIN public.topics topic_row ON topic_row.id = lesson_row.topic_id
  INNER JOIN public.courses course_row ON course_row.id = topic_row.course_id
  WHERE lesson_row.id = NEW.lesson_id;

  IF v_institution_id IS NULL THEN
    RAISE EXCEPTION 'lesson_blocks: missing institution for lesson % (course.institution_id null)', NEW.lesson_id;
  END IF;

  NEW.institution_id := v_institution_id;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.lesson_blocks_before_insert_set_institution() IS
  'Sets institution_id from lessons → topics → courses; SECURITY DEFINER with '
  'row_security off for the bounded tenant-key read only. Prevents client '
  'spoofing tenant and avoids RLS re-entry on the lessons chain.';

-- -----------------------------------------------------------------------------
-- 7. RLS — replace EXISTS chains on lesson_blocks with helper calls
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS lesson_blocks_select_lesson_scope ON public.lesson_blocks;
CREATE POLICY lesson_blocks_select_lesson_scope ON public.lesson_blocks
  FOR SELECT TO authenticated
  USING (
    (SELECT app.is_super_admin()) IS TRUE
    OR institution_id IN (SELECT app.admin_institution_ids())
    OR app.teacher_can_manage_lesson(lesson_id)
    OR (SELECT app.student_can_access_lesson(lesson_id))
  );

DROP POLICY IF EXISTS lesson_blocks_insert_teacher ON public.lesson_blocks;
CREATE POLICY lesson_blocks_insert_teacher ON public.lesson_blocks
  FOR INSERT TO authenticated
  WITH CHECK (app.teacher_can_manage_lesson(lesson_id));

DROP POLICY IF EXISTS lesson_blocks_update_teacher ON public.lesson_blocks;
CREATE POLICY lesson_blocks_update_teacher ON public.lesson_blocks
  FOR UPDATE TO authenticated
  USING (app.teacher_can_manage_lesson(lesson_id))
  WITH CHECK (app.teacher_can_manage_lesson(lesson_id));

DROP POLICY IF EXISTS lesson_blocks_delete_teacher ON public.lesson_blocks;
CREATE POLICY lesson_blocks_delete_teacher ON public.lesson_blocks
  FOR DELETE TO authenticated
  USING (app.teacher_can_manage_lesson(lesson_id));
