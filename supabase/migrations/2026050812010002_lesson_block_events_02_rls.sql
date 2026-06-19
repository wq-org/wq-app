-- HETZNER_TEARDOWN: SAFE_TO_DELETE_LATER | WQ-BLOCK-ANALYTICS | lesson_block_events RLS (retired; table dropped in 20260516000003) | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- ⚠️ RETIRED TABLE — DO NOT USE. RLS for lesson_block_events, which is DROPPED
-- by 20260516000003_lesson_draft_jsonb_04_retire_legacy_blocks.sql. The table
-- no longer exists in the live schema; block-level analytics moved to
-- learning_events. Kept only as immutable migration history — do NOT delete
-- this file and do NOT add new references to this table.
-- =============================================================================
-- LESSON BLOCK EVENTS — RLS policies
-- Requires: 20260508120100_lesson_block_events_01_tables.sql
-- =============================================================================
-- Students may insert their own events for institutions they belong to.
-- Read access: own student rows, teacher of the lesson's course, institution
-- admin, super admin.
-- =============================================================================

ALTER TABLE public.lesson_block_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_block_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lesson_block_events_all_super_admin ON public.lesson_block_events;
CREATE POLICY lesson_block_events_all_super_admin ON public.lesson_block_events
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS lesson_block_events_insert_student ON public.lesson_block_events;
CREATE POLICY lesson_block_events_insert_student ON public.lesson_block_events
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND institution_id IN (SELECT app.member_institution_ids())
  );

DROP POLICY IF EXISTS lesson_block_events_select_own_student ON public.lesson_block_events;
CREATE POLICY lesson_block_events_select_own_student ON public.lesson_block_events
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS lesson_block_events_select_teacher ON public.lesson_block_events;
CREATE POLICY lesson_block_events_select_teacher ON public.lesson_block_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      INNER JOIN public.topics t ON t.id = l.topic_id
      INNER JOIN public.courses c ON c.id = t.course_id
      WHERE l.id = lesson_block_events.lesson_id
        AND c.teacher_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS lesson_block_events_select_institution_admin ON public.lesson_block_events;
CREATE POLICY lesson_block_events_select_institution_admin ON public.lesson_block_events
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));
