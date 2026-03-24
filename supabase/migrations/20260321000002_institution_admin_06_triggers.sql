-- =============================================================================
-- INSTITUTION ADMIN — Triggers
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

DROP TRIGGER IF EXISTS memberships_updated_at ON public.institution_memberships;
CREATE TRIGGER memberships_updated_at
  BEFORE UPDATE ON public.institution_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS faculties_updated_at ON public.faculties;
CREATE TRIGGER faculties_updated_at
  BEFORE UPDATE ON public.faculties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS programmes_updated_at ON public.programmes;
CREATE TRIGGER programmes_updated_at
  BEFORE UPDATE ON public.programmes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS cohorts_updated_at ON public.cohorts;
CREATE TRIGGER cohorts_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS class_groups_updated_at ON public.class_groups;
CREATE TRIGGER class_groups_updated_at
  BEFORE UPDATE ON public.class_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS staff_scopes_updated_at ON public.institution_staff_scopes;
CREATE TRIGGER staff_scopes_updated_at
  BEFORE UPDATE ON public.institution_staff_scopes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS classrooms_updated_at ON public.classrooms;
CREATE TRIGGER classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS classroom_members_updated_at ON public.classroom_members;
CREATE TRIGGER classroom_members_updated_at
  BEFORE UPDATE ON public.classroom_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS inst_settings_updated_at ON public.institution_settings;
CREATE TRIGGER inst_settings_updated_at
  BEFORE UPDATE ON public.institution_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS quotas_updated_at ON public.institution_quotas_usage;
CREATE TRIGGER quotas_updated_at
  BEFORE UPDATE ON public.institution_quotas_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS invoice_records_updated_at ON public.institution_invoice_records;
CREATE TRIGGER invoice_records_updated_at
  BEFORE UPDATE ON public.institution_invoice_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS dsr_updated_at ON public.data_subject_requests;
CREATE TRIGGER dsr_updated_at
  BEFORE UPDATE ON public.data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
