-- HETZNER_TEARDOWN: PARTIAL_SAFE_TO_DELETE_LATER | WQ-ORG-HIERARCHY | faculty→programme→cohort→class_group + programme/cohort/class_group_offerings + institution_staff_scopes — strip all hierarchy DDL/RLS/triggers/seeds; KEEP institution_memberships/classrooms/classroom_members/institution_invites/institution_settings/quotas + membership enums + core app/RPC helpers | see docs/perplexity/WQ_TEARDOWN_minimal_core.md
-- =============================================================================
-- INSTITUTION ADMIN — RLS Policies
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260000000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- =============================================================================
-- 5. INSTITUTION MEMBERSHIPS — RLS
-- =============================================================================
ALTER TABLE public.institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_memberships FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS memberships_super_admin ON public.institution_memberships;
DROP POLICY IF EXISTS institution_memberships_all_super_admin ON public.institution_memberships;
CREATE POLICY institution_memberships_all_super_admin ON public.institution_memberships
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS memberships_institution_admin ON public.institution_memberships;
DROP POLICY IF EXISTS institution_memberships_all_institution_admin ON public.institution_memberships;
CREATE POLICY institution_memberships_all_institution_admin ON public.institution_memberships
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

DROP POLICY IF EXISTS memberships_own_read ON public.institution_memberships;
DROP POLICY IF EXISTS institution_memberships_select_own ON public.institution_memberships;
CREATE POLICY institution_memberships_select_own ON public.institution_memberships
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

-- =============================================================================
-- 5b. INSTITUTIONS — multitenant RLS (source of truth; replaces baseline + Feb)
--     Super admin: full access. Members: read own tenants (not soft-deleted).
--     Institution admins: update their tenant row; cannot set deleted_at via RLS check.
-- =============================================================================
DROP POLICY IF EXISTS "Everyone can view institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins can manage institutions" ON public.institutions;
DROP POLICY IF EXISTS "Admins and SuperAdmin can manage institutions" ON public.institutions;

DROP POLICY IF EXISTS institutions_super_admin ON public.institutions;
DROP POLICY IF EXISTS institutions_all_super_admin ON public.institutions;
CREATE POLICY institutions_all_super_admin ON public.institutions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS institutions_member_select ON public.institutions;
DROP POLICY IF EXISTS institutions_select_member ON public.institutions;
CREATE POLICY institutions_select_member ON public.institutions
  FOR SELECT TO authenticated
  USING (
    deleted_at is null
    AND id in (select app.member_institution_ids())
  );

DROP POLICY IF EXISTS institutions_admin_update ON public.institutions;
DROP POLICY IF EXISTS institutions_update_institution_admin ON public.institutions;
CREATE POLICY institutions_update_institution_admin ON public.institutions
  FOR UPDATE TO authenticated
  USING (
    deleted_at is null
    AND id in (select app.admin_institution_ids())
  )
  WITH CHECK (
    deleted_at is null
    AND id in (select app.admin_institution_ids())
  );

-- =============================================================================
-- 11. CLASSROOMS — RLS
-- =============================================================================
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classrooms_super_admin ON public.classrooms;
DROP POLICY IF EXISTS classrooms_all_super_admin ON public.classrooms;
CREATE POLICY classrooms_all_super_admin ON public.classrooms
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS classrooms_institution_admin ON public.classrooms;
DROP POLICY IF EXISTS classrooms_all_institution_admin ON public.classrooms;
CREATE POLICY classrooms_all_institution_admin ON public.classrooms
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

-- =============================================================================
-- 11b. CLASSROOM_MEMBERS — RLS
-- =============================================================================
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS classroom_members_super_admin ON public.classroom_members;
DROP POLICY IF EXISTS classroom_members_all_super_admin ON public.classroom_members;
CREATE POLICY classroom_members_all_super_admin ON public.classroom_members
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS classroom_members_institution_admin ON public.classroom_members;
DROP POLICY IF EXISTS classroom_members_all_institution_admin ON public.classroom_members;
CREATE POLICY classroom_members_all_institution_admin ON public.classroom_members
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

DROP POLICY IF EXISTS classroom_members_primary_teacher_manage ON public.classroom_members;
DROP POLICY IF EXISTS classroom_members_all_primary_teacher ON public.classroom_members;
CREATE POLICY classroom_members_all_primary_teacher ON public.classroom_members
  FOR ALL TO authenticated
  USING (app.auth_is_primary_teacher_of_classroom(classroom_id))
  WITH CHECK (
    app.auth_is_primary_teacher_of_classroom(classroom_id)
    AND institution_id = app.classroom_institution_id(classroom_id)
  );

DROP POLICY IF EXISTS classroom_members_own_read ON public.classroom_members;
DROP POLICY IF EXISTS classroom_members_select_own ON public.classroom_members;
CREATE POLICY classroom_members_select_own ON public.classroom_members
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

-- Co-teacher check goes through app.auth_is_co_teacher_of_classroom: an inline
-- EXISTS on classroom_members re-enters this table's own policies (42P17).
DROP POLICY IF EXISTS classroom_members_teacher_roster_read ON public.classroom_members;
DROP POLICY IF EXISTS classroom_members_select_teacher_roster ON public.classroom_members;
CREATE POLICY classroom_members_select_teacher_roster ON public.classroom_members
  FOR SELECT TO authenticated
  USING (
    app.auth_is_primary_teacher_of_classroom(classroom_id)
    OR app.auth_is_co_teacher_of_classroom(classroom_id)
  );

-- Tighten classroom visibility now that classroom_members exists.
DROP POLICY IF EXISTS classrooms_member_read ON public.classrooms;
DROP POLICY IF EXISTS classrooms_scoped_read ON public.classrooms;
DROP POLICY IF EXISTS classrooms_select_member ON public.classrooms;
CREATE POLICY classrooms_select_member ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    institution_id in (select app.member_institution_ids())
    AND (
      primary_teacher_id = (select app.auth_uid())
      OR app.auth_has_active_classroom_membership(id)
    )
  );

-- =============================================================================
-- 12. INSTITUTION SETTINGS — RLS
-- =============================================================================
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inst_settings_super_admin ON public.institution_settings;
DROP POLICY IF EXISTS institution_settings_all_super_admin ON public.institution_settings;
CREATE POLICY institution_settings_all_super_admin ON public.institution_settings
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS inst_settings_institution_admin ON public.institution_settings;
DROP POLICY IF EXISTS institution_settings_all_institution_admin ON public.institution_settings;
CREATE POLICY institution_settings_all_institution_admin ON public.institution_settings
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

DROP POLICY IF EXISTS inst_settings_member_read ON public.institution_settings;
DROP POLICY IF EXISTS institution_settings_select_member ON public.institution_settings;
CREATE POLICY institution_settings_select_member ON public.institution_settings
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- =============================================================================
-- 13. INSTITUTION QUOTAS USAGE — RLS
-- =============================================================================
ALTER TABLE public.institution_quotas_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_quotas_usage FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS quotas_super_admin ON public.institution_quotas_usage;
DROP POLICY IF EXISTS institution_quotas_usage_all_super_admin ON public.institution_quotas_usage;
CREATE POLICY institution_quotas_usage_all_super_admin ON public.institution_quotas_usage
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS quotas_institution_admin ON public.institution_quotas_usage;
DROP POLICY IF EXISTS institution_quotas_usage_select_institution_admin ON public.institution_quotas_usage;
CREATE POLICY institution_quotas_usage_select_institution_admin ON public.institution_quotas_usage
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

-- =============================================================================
-- 13f. INSTITUTION INVITES — RLS
-- =============================================================================
ALTER TABLE public.institution_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_invites FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS institution_invites_super_admin ON public.institution_invites;
DROP POLICY IF EXISTS institution_invites_all_super_admin ON public.institution_invites;
CREATE POLICY institution_invites_all_super_admin ON public.institution_invites
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS institution_invites_institution_admin_select ON public.institution_invites;
DROP POLICY IF EXISTS institution_invites_select_institution_admin ON public.institution_invites;
CREATE POLICY institution_invites_select_institution_admin ON public.institution_invites
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

GRANT SELECT ON public.institution_invites TO authenticated;

-- =============================================================================
-- 14. INSTITUTION INVOICE RECORDS — RLS
-- =============================================================================
ALTER TABLE public.institution_invoice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_invoice_records FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invoice_records_super_admin ON public.institution_invoice_records;
DROP POLICY IF EXISTS institution_invoice_records_all_super_admin ON public.institution_invoice_records;
CREATE POLICY institution_invoice_records_all_super_admin ON public.institution_invoice_records
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS invoice_records_institution_admin ON public.institution_invoice_records;
DROP POLICY IF EXISTS institution_invoice_records_select_institution_admin ON public.institution_invoice_records;
CREATE POLICY institution_invoice_records_select_institution_admin ON public.institution_invoice_records
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

-- =============================================================================
-- 15. DATA SUBJECT REQUESTS — RLS
-- =============================================================================
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dsr_super_admin ON public.data_subject_requests;
DROP POLICY IF EXISTS data_subject_requests_all_super_admin ON public.data_subject_requests;
CREATE POLICY data_subject_requests_all_super_admin ON public.data_subject_requests
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

DROP POLICY IF EXISTS dsr_institution_admin ON public.data_subject_requests;
DROP POLICY IF EXISTS data_subject_requests_all_institution_admin ON public.data_subject_requests;
CREATE POLICY data_subject_requests_all_institution_admin ON public.data_subject_requests
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

-- =============================================================================
-- 16. ADDITIONAL RLS — institution-admin / member reads on platform tables (file 1)
-- =============================================================================

DROP POLICY IF EXISTS inst_subs_institution_admin ON public.institution_subscriptions;
DROP POLICY IF EXISTS institution_subscriptions_select_institution_admin ON public.institution_subscriptions;
CREATE POLICY institution_subscriptions_select_institution_admin ON public.institution_subscriptions
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

-- Members read entitlement overrides for effective feature resolution (doc 14 §7).
DROP POLICY IF EXISTS inst_entitlement_overrides_member_read ON public.institution_entitlement_overrides;
DROP POLICY IF EXISTS institution_entitlement_overrides_select_member ON public.institution_entitlement_overrides;
CREATE POLICY institution_entitlement_overrides_select_member ON public.institution_entitlement_overrides
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- Institution admins see PSP linkage for their tenant (doc 14 §8.6).
DROP POLICY IF EXISTS billing_providers_institution_admin_select ON public.billing_providers;
DROP POLICY IF EXISTS billing_providers_select_institution_admin ON public.billing_providers;
CREATE POLICY billing_providers_select_institution_admin ON public.billing_providers
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));
