-- =============================================================================
-- REWARDS MVP — RLS policies
-- Split from 20260323000007_rewards_mvp.sql
-- Requires: 20260321000002_institution_admin (all parts)
-- =============================================================================

-- point_ledger
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

-- classroom_reward_settings
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
