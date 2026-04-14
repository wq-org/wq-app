-- =============================================================================
-- REWARDS MVP — RLS policies
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- point_ledger
ALTER TABLE public.point_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_ledger FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pl_super_admin ON public.point_ledger;
DROP POLICY IF EXISTS point_ledger_all_super_admin ON public.point_ledger;
CREATE POLICY point_ledger_all_super_admin ON public.point_ledger
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS pl_own_read ON public.point_ledger;
DROP POLICY IF EXISTS point_ledger_select_own ON public.point_ledger;
CREATE POLICY point_ledger_select_own ON public.point_ledger
  FOR SELECT TO authenticated
  USING (user_id = (SELECT app.auth_uid()));

DROP POLICY IF EXISTS pl_teacher_manage ON public.point_ledger;
DROP POLICY IF EXISTS point_ledger_all_teacher ON public.point_ledger;
CREATE POLICY point_ledger_all_teacher ON public.point_ledger
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  )
  WITH CHECK (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

DROP POLICY IF EXISTS pl_institution_admin ON public.point_ledger;
DROP POLICY IF EXISTS point_ledger_all_institution_admin ON public.point_ledger;
CREATE POLICY point_ledger_all_institution_admin ON public.point_ledger
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS pl_member_read ON public.point_ledger;
DROP POLICY IF EXISTS point_ledger_select_member ON public.point_ledger;
CREATE POLICY point_ledger_select_member ON public.point_ledger
  FOR SELECT TO authenticated
  USING (
    classroom_id IS NOT NULL
    AND classroom_id IN (SELECT app.list_active_classroom_ids())
  );

-- classroom_reward_settings
ALTER TABLE public.classroom_reward_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_reward_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crs_super_admin ON public.classroom_reward_settings;
DROP POLICY IF EXISTS classroom_reward_settings_all_super_admin ON public.classroom_reward_settings;
CREATE POLICY classroom_reward_settings_all_super_admin ON public.classroom_reward_settings
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS crs_institution_admin ON public.classroom_reward_settings;
DROP POLICY IF EXISTS classroom_reward_settings_all_institution_admin ON public.classroom_reward_settings;
CREATE POLICY classroom_reward_settings_all_institution_admin ON public.classroom_reward_settings
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS crs_teacher_manage ON public.classroom_reward_settings;
DROP POLICY IF EXISTS classroom_reward_settings_all_teacher ON public.classroom_reward_settings;
CREATE POLICY classroom_reward_settings_all_teacher ON public.classroom_reward_settings
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  )
  WITH CHECK (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (SELECT app.auth_uid())
    )
    OR classroom_id IN (
      SELECT cm.classroom_id FROM public.classroom_members cm
      WHERE cm.user_id = (SELECT app.auth_uid())
        AND cm.withdrawn_at IS NULL
        AND cm.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

DROP POLICY IF EXISTS crs_member_read ON public.classroom_reward_settings;
DROP POLICY IF EXISTS classroom_reward_settings_select_member ON public.classroom_reward_settings;
CREATE POLICY classroom_reward_settings_select_member ON public.classroom_reward_settings
  FOR SELECT TO authenticated
  USING (classroom_id IN (SELECT app.list_active_classroom_ids()));
