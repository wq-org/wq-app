-- =============================================================================
-- PHASE G — Rewards MVP (point ledger + classroom settings)
--
-- Doc map:
--   10_Reward_System → point_ledger, classroom_reward_settings
--   db_guide_line_en.md → FORCE RLS, institution_id, COMMENT ON
--
-- Full joker redemption workflow deferred; this provides the point accounting
-- backbone and per-classroom reward configuration.
--
-- Requires: 20260321000002 (classrooms, institution_memberships, app.*)
-- =============================================================================

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE point_source AS ENUM (
    'game_correct', 'game_speed_bonus', 'game_streak',
    'game_versus_win', 'task_on_time', 'lesson_complete',
    'daily_streak', 'personal_best', 'manual_adjustment'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 2. POINT_LEDGER — append-only point log
-- =============================================================================
CREATE TABLE public.point_ledger (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid          NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid          NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  user_id         uuid          NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  points          integer       NOT NULL,
  source          point_source  NOT NULL,
  ref_id          uuid,
  ref_type        text,
  description     text,
  created_at      timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.point_ledger                IS 'Append-only point log per student per classroom (doc 10).';
COMMENT ON COLUMN public.point_ledger.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.point_ledger.classroom_id   IS 'Points accumulate per classroom per school year.';
COMMENT ON COLUMN public.point_ledger.points         IS 'Positive = earned; negative = spent (joker redemption).';
COMMENT ON COLUMN public.point_ledger.source         IS 'What earned/spent the points.';
COMMENT ON COLUMN public.point_ledger.ref_id         IS 'FK to source entity (game_session_participant, task, lesson, etc).';
COMMENT ON COLUMN public.point_ledger.ref_type       IS 'Entity type for ref_id: game_session, task, lesson, joker, etc.';

CREATE INDEX idx_pl_user_classroom ON public.point_ledger (user_id, classroom_id);
CREATE INDEX idx_pl_institution    ON public.point_ledger (institution_id);
CREATE INDEX idx_pl_classroom      ON public.point_ledger (classroom_id);

ALTER TABLE public.point_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_ledger FORCE ROW LEVEL SECURITY;

CREATE POLICY pl_super_admin ON public.point_ledger
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY pl_own_read ON public.point_ledger
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

CREATE POLICY pl_teacher_manage ON public.point_ledger
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  )
  WITH CHECK (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

CREATE POLICY pl_institution_admin ON public.point_ledger
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

CREATE POLICY pl_member_read ON public.point_ledger
  FOR SELECT TO authenticated
  USING (
    classroom_id IS NOT NULL
    AND classroom_id IN (select app.my_active_classroom_ids())
  );

-- =============================================================================
-- 3. CLASSROOM_REWARD_SETTINGS — per-classroom reward configuration
-- =============================================================================
CREATE TABLE public.classroom_reward_settings (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id  uuid        NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  classroom_id    uuid        NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  leaderboard_opt_in boolean NOT NULL DEFAULT false,
  joker_config    jsonb       NOT NULL DEFAULT '[]'::jsonb,
  level_thresholds jsonb      NOT NULL DEFAULT '[{"level":1,"name":"Einsteiger","min_points":0},{"level":2,"name":"Lernprofi","min_points":500},{"level":3,"name":"Wissensträger","min_points":1500},{"level":4,"name":"Experte","min_points":3500},{"level":5,"name":"Meister","min_points":7000}]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.classroom_reward_settings                   IS 'Per-classroom reward settings: joker config, levels, leaderboard (doc 10).';
COMMENT ON COLUMN public.classroom_reward_settings.institution_id    IS 'Tenant boundary.';
COMMENT ON COLUMN public.classroom_reward_settings.leaderboard_opt_in IS 'Whether the classroom leaderboard is visible to students.';
COMMENT ON COLUMN public.classroom_reward_settings.joker_config      IS 'Array of {code, name, cost, monthly_limit, enabled}.';
COMMENT ON COLUMN public.classroom_reward_settings.level_thresholds  IS 'Array of {level, name, min_points} defining rank tiers.';

CREATE UNIQUE INDEX idx_crs_classroom
  ON public.classroom_reward_settings (classroom_id);

CREATE INDEX idx_crs_institution ON public.classroom_reward_settings (institution_id);

ALTER TABLE public.classroom_reward_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_reward_settings FORCE ROW LEVEL SECURITY;

CREATE POLICY crs_super_admin ON public.classroom_reward_settings
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY crs_institution_admin ON public.classroom_reward_settings
  FOR ALL TO authenticated
  USING  (institution_id IN (select app.admin_institution_ids()))
  WITH CHECK (institution_id IN (select app.admin_institution_ids()));

CREATE POLICY crs_teacher_manage ON public.classroom_reward_settings
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  )
  WITH CHECK (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (select app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

CREATE POLICY crs_member_read ON public.classroom_reward_settings
  FOR SELECT TO authenticated
  USING (classroom_id IN (select app.my_active_classroom_ids()));

DROP TRIGGER IF EXISTS crs_updated_at ON public.classroom_reward_settings;
CREATE TRIGGER crs_updated_at
  BEFORE UPDATE ON public.classroom_reward_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
