-- =============================================================================
-- GAME ANALYTICS ALIGNMENT — RLS policies
-- Requires: 20260331000001_game_analytics_alignment_06_triggers.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- game_deliveries
-- -----------------------------------------------------------------------------
ALTER TABLE public.game_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_deliveries FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS game_deliveries_all_super_admin ON public.game_deliveries;
CREATE POLICY game_deliveries_all_super_admin ON public.game_deliveries
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS game_deliveries_all_institution_admin ON public.game_deliveries;
CREATE POLICY game_deliveries_all_institution_admin ON public.game_deliveries
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS game_deliveries_all_teacher ON public.game_deliveries;
CREATE POLICY game_deliveries_all_teacher ON public.game_deliveries
  FOR ALL TO authenticated
  USING (
    game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    OR EXISTS (
      SELECT 1
      FROM public.classrooms cr
      WHERE cr.id = game_deliveries.classroom_id
        AND cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.classroom_members cm
      WHERE cm.classroom_id = game_deliveries.classroom_id
        AND cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  )
  WITH CHECK (
    game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    OR EXISTS (
      SELECT 1
      FROM public.classrooms cr
      WHERE cr.id = game_deliveries.classroom_id
        AND cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR EXISTS (
      SELECT 1
      FROM public.classroom_members cm
      WHERE cm.classroom_id = game_deliveries.classroom_id
        AND cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

DROP POLICY IF EXISTS game_deliveries_select_member ON public.game_deliveries;
CREATE POLICY game_deliveries_select_member ON public.game_deliveries
  FOR SELECT TO authenticated
  USING (
    (SELECT app.student_can_access_game_delivery(id)) IS TRUE
  );

-- -----------------------------------------------------------------------------
-- game_run_stats_scoped
-- -----------------------------------------------------------------------------
ALTER TABLE public.game_run_stats_scoped ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_run_stats_scoped FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS game_run_stats_scoped_all_super_admin ON public.game_run_stats_scoped;
CREATE POLICY game_run_stats_scoped_all_super_admin ON public.game_run_stats_scoped
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS game_run_stats_scoped_select_institution_admin ON public.game_run_stats_scoped;
CREATE POLICY game_run_stats_scoped_select_institution_admin ON public.game_run_stats_scoped
  FOR SELECT TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS game_run_stats_scoped_select_teacher ON public.game_run_stats_scoped;
CREATE POLICY game_run_stats_scoped_select_teacher ON public.game_run_stats_scoped
  FOR SELECT TO authenticated
  USING (
    game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    OR (
      game_delivery_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.game_deliveries gd
        INNER JOIN public.classrooms cr ON gd.classroom_id = cr.id
        WHERE gd.id = game_run_stats_scoped.game_delivery_id
          AND (
            cr.primary_teacher_id = (SELECT app.auth_uid())
            OR EXISTS (
              SELECT 1
              FROM public.classroom_members cm
              WHERE cm.classroom_id = gd.classroom_id
                AND cm.user_id = (SELECT app.auth_uid())
                AND cm.withdrawn_at IS NULL
                AND cm.membership_role = 'co_teacher'::public.classroom_member_role
            )
          )
      )
    )
  );

DROP POLICY IF EXISTS game_run_stats_scoped_select_own_member ON public.game_run_stats_scoped;
CREATE POLICY game_run_stats_scoped_select_own_member ON public.game_run_stats_scoped
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT app.auth_uid())
    AND institution_id IN (SELECT app.member_institution_ids())
    AND (
      game_delivery_id IS NULL
      OR (SELECT app.student_can_access_game_delivery(game_delivery_id)) IS TRUE
    )
  );

-- -----------------------------------------------------------------------------
-- game_runs delivery-first member and teacher reads
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS game_runs_select_member ON public.game_runs;
CREATE POLICY game_runs_select_member ON public.game_runs
  FOR SELECT TO authenticated
  USING (
    (
      game_delivery_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.game_deliveries gd
        WHERE gd.id = game_runs.game_delivery_id
          AND (
            (SELECT app.student_can_access_game_delivery(gd.id)) IS TRUE
            OR gd.institution_id IN (SELECT app.member_institution_ids())
          )
      )
    )
    OR (
      game_delivery_id IS NULL
      AND (
        (
          classroom_id IS NULL
          AND institution_id IN (SELECT app.member_institution_ids())
        )
        OR (
          classroom_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.classroom_members cm
            WHERE cm.classroom_id = game_runs.classroom_id
              AND cm.user_id = (SELECT app.auth_uid())
              AND cm.withdrawn_at IS NULL
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS game_runs_all_teacher ON public.game_runs;
CREATE POLICY game_runs_all_teacher ON public.game_runs
  FOR ALL TO authenticated
  USING (
    started_by = (SELECT app.auth_uid())
    OR game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    OR (
      game_delivery_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.game_deliveries gd
        INNER JOIN public.classrooms cr ON gd.classroom_id = cr.id
        WHERE gd.id = game_runs.game_delivery_id
          AND (
            cr.primary_teacher_id = (SELECT app.auth_uid())
            OR EXISTS (
              SELECT 1 FROM public.classroom_members cm
              WHERE cm.classroom_id = gd.classroom_id
                AND cm.user_id = (SELECT app.auth_uid())
                AND cm.withdrawn_at IS NULL
                AND cm.membership_role = 'co_teacher'::public.classroom_member_role
            )
          )
      )
    )
  )
  WITH CHECK (
    started_by = (SELECT app.auth_uid())
    OR game_id IN (SELECT id FROM public.games
WHERE teacher_id = (SELECT app.auth_uid()))
    OR (
      game_delivery_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.game_deliveries gd
        INNER JOIN public.classrooms cr ON gd.classroom_id = cr.id
        WHERE gd.id = game_runs.game_delivery_id
          AND (
            cr.primary_teacher_id = (SELECT app.auth_uid())
            OR EXISTS (
              SELECT 1 FROM public.classroom_members cm
              WHERE cm.classroom_id = gd.classroom_id
                AND cm.user_id = (SELECT app.auth_uid())
                AND cm.withdrawn_at IS NULL
                AND cm.membership_role = 'co_teacher'::public.classroom_member_role
            )
          )
      )
    )
  );

-- -----------------------------------------------------------------------------
-- learning_events: enforce optional game_delivery scope integrity on insert
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
    AND (
      game_delivery_id IS NULL
      OR (
        (SELECT app.student_can_access_game_delivery(game_delivery_id)) IS TRUE
        AND EXISTS (
          SELECT 1
          FROM public.game_deliveries gd
          WHERE gd.id = learning_events.game_delivery_id
            AND gd.institution_id = learning_events.institution_id
        )
      )
    )
  );

-- -----------------------------------------------------------------------------
-- Manual policy smoke checklist (run as each role/session)
-- -----------------------------------------------------------------------------
-- 1) student: select assigned game_delivery rows; cannot read other institutions.
-- 2) teacher: read game_run_stats_scoped for own games and classroom deliveries.
-- 3) institution_admin: read all game_deliveries/game_run_stats_scoped in admin institutions.
-- 4) student insert learning_events with valid/invalid game_delivery_id.
