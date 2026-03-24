-- =============================================================================
-- INSTITUTION ADMIN — RLS Policies
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

-- =============================================================================
-- 5. INSTITUTION MEMBERSHIPS — RLS
-- =============================================================================
ALTER TABLE public.institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY memberships_super_admin ON public.institution_memberships
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY memberships_institution_admin ON public.institution_memberships
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY memberships_own_read ON public.institution_memberships
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

CREATE POLICY institutions_super_admin ON public.institutions
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY institutions_member_select ON public.institutions
  FOR SELECT TO authenticated
  USING (
    deleted_at is null
    AND id in (select app.member_institution_ids())
  );

CREATE POLICY institutions_admin_update ON public.institutions
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
-- 6. FACULTIES — RLS
-- =============================================================================
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties FORCE ROW LEVEL SECURITY;

CREATE POLICY faculties_super_admin ON public.faculties
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY faculties_institution_admin ON public.faculties
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY faculties_member_read ON public.faculties
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- =============================================================================
-- 7. PROGRAMMES — RLS
-- =============================================================================
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes FORCE ROW LEVEL SECURITY;

CREATE POLICY programmes_super_admin ON public.programmes
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY programmes_institution_admin ON public.programmes
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY programmes_member_read ON public.programmes
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- =============================================================================
-- 8. COHORTS — RLS
-- =============================================================================
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts FORCE ROW LEVEL SECURITY;

CREATE POLICY cohorts_super_admin ON public.cohorts
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY cohorts_institution_admin ON public.cohorts
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY cohorts_member_read ON public.cohorts
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- =============================================================================
-- 9. CLASS GROUPS — RLS
-- =============================================================================
ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_groups FORCE ROW LEVEL SECURITY;

CREATE POLICY class_groups_super_admin ON public.class_groups
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY class_groups_institution_admin ON public.class_groups
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY class_groups_member_read ON public.class_groups
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- =============================================================================
-- 10. INSTITUTION STAFF SCOPES — RLS
-- =============================================================================
ALTER TABLE public.institution_staff_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_staff_scopes FORCE ROW LEVEL SECURITY;

CREATE POLICY staff_scopes_super_admin ON public.institution_staff_scopes
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY staff_scopes_institution_admin ON public.institution_staff_scopes
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY staff_scopes_own_read ON public.institution_staff_scopes
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

-- =============================================================================
-- 11. CLASSROOMS — RLS
-- =============================================================================
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms FORCE ROW LEVEL SECURITY;

CREATE POLICY classrooms_super_admin ON public.classrooms
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY classrooms_institution_admin ON public.classrooms
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY classrooms_member_read ON public.classrooms
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- =============================================================================
-- 11b. CLASSROOM_MEMBERS — RLS
-- =============================================================================
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members FORCE ROW LEVEL SECURITY;

CREATE POLICY classroom_members_super_admin ON public.classroom_members
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY classroom_members_institution_admin ON public.classroom_members
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY classroom_members_primary_teacher_manage ON public.classroom_members
  FOR ALL TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
  )
  WITH CHECK (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    AND institution_id IN (
      SELECT cr2.institution_id FROM public.classrooms cr2
      WHERE cr2.id = classroom_id
    )
  );

CREATE POLICY classroom_members_own_read ON public.classroom_members
  FOR SELECT TO authenticated
  USING (user_id = (select app.auth_uid()));

CREATE POLICY classroom_members_teacher_roster_read ON public.classroom_members
  FOR SELECT TO authenticated
  USING (
    classroom_id IN (
      SELECT cr.id FROM public.classrooms cr
      WHERE cr.primary_teacher_id = (select app.auth_uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.classroom_members cm_lead
      WHERE cm_lead.classroom_id = classroom_members.classroom_id
        AND cm_lead.user_id = (select app.auth_uid())
        AND cm_lead.withdrawn_at IS NULL
        AND cm_lead.membership_role = 'co_teacher'::public.classroom_member_role
    )
  );

-- Tighten classroom visibility now that classroom_members exists.
DROP POLICY IF EXISTS classrooms_member_read ON public.classrooms;
CREATE POLICY classrooms_scoped_read ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    institution_id in (select app.member_institution_ids())
    AND (
      primary_teacher_id = (select app.auth_uid())
      OR EXISTS (
        SELECT 1 FROM public.classroom_members cm
        WHERE cm.classroom_id = classrooms.id
          AND cm.user_id = (select app.auth_uid())
          AND cm.withdrawn_at IS NULL
      )
    )
  );

-- =============================================================================
-- 12. INSTITUTION SETTINGS — RLS
-- =============================================================================
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_settings FORCE ROW LEVEL SECURITY;

CREATE POLICY inst_settings_super_admin ON public.institution_settings
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY inst_settings_institution_admin ON public.institution_settings
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

CREATE POLICY inst_settings_member_read ON public.institution_settings
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- =============================================================================
-- 13. INSTITUTION QUOTAS USAGE — RLS
-- =============================================================================
ALTER TABLE public.institution_quotas_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_quotas_usage FORCE ROW LEVEL SECURITY;

CREATE POLICY quotas_super_admin ON public.institution_quotas_usage
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY quotas_institution_admin ON public.institution_quotas_usage
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

-- =============================================================================
-- 13f. INSTITUTION INVITES — RLS
-- =============================================================================
ALTER TABLE public.institution_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_invites FORCE ROW LEVEL SECURITY;

CREATE POLICY institution_invites_super_admin ON public.institution_invites
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY institution_invites_institution_admin_select ON public.institution_invites
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

GRANT SELECT ON public.institution_invites TO authenticated;

-- =============================================================================
-- 14. INSTITUTION INVOICE RECORDS — RLS
-- =============================================================================
ALTER TABLE public.institution_invoice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_invoice_records FORCE ROW LEVEL SECURITY;

CREATE POLICY invoice_records_super_admin ON public.institution_invoice_records
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY invoice_records_institution_admin ON public.institution_invoice_records
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

-- =============================================================================
-- 15. DATA SUBJECT REQUESTS — RLS
-- =============================================================================
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests FORCE ROW LEVEL SECURITY;

CREATE POLICY dsr_super_admin ON public.data_subject_requests
  FOR ALL TO authenticated
  USING  ((select app.is_super_admin()) is true)
  WITH CHECK ((select app.is_super_admin()) is true);

CREATE POLICY dsr_institution_admin ON public.data_subject_requests
  FOR ALL TO authenticated
  USING (institution_id in (select app.admin_institution_ids()))
  WITH CHECK (institution_id in (select app.admin_institution_ids()));

-- =============================================================================
-- 16. ADDITIONAL RLS — institution-admin / member reads on platform tables (file 1)
-- =============================================================================

DROP POLICY IF EXISTS inst_subs_institution_admin ON public.institution_subscriptions;
CREATE POLICY inst_subs_institution_admin ON public.institution_subscriptions
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));

-- Members read entitlement overrides for effective feature resolution (doc 14 §7).
DROP POLICY IF EXISTS inst_entitlement_overrides_member_read ON public.institution_entitlement_overrides;
CREATE POLICY inst_entitlement_overrides_member_read ON public.institution_entitlement_overrides
  FOR SELECT TO authenticated
  USING (institution_id in (select app.member_institution_ids()));

-- Institution admins see PSP linkage for their tenant (doc 14 §8.6).
DROP POLICY IF EXISTS billing_providers_institution_admin_select ON public.billing_providers;
CREATE POLICY billing_providers_institution_admin_select ON public.billing_providers
  FOR SELECT TO authenticated
  USING (institution_id in (select app.admin_institution_ids()));
