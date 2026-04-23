-- =============================================================================
-- INSTITUTION ADMIN — Triggers
-- Split from 20260321000002_institution_admin.sql
-- Requires: 20260209000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

DROP TRIGGER IF EXISTS memberships_updated_at ON public.institution_memberships;
DROP TRIGGER IF EXISTS trg_institution_memberships_set_updated_at ON public.institution_memberships;
CREATE TRIGGER trg_institution_memberships_set_updated_at
  BEFORE UPDATE ON public.institution_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS faculties_updated_at ON public.faculties;
DROP TRIGGER IF EXISTS trg_faculties_set_updated_at ON public.faculties;
CREATE TRIGGER trg_faculties_set_updated_at
  BEFORE UPDATE ON public.faculties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS programmes_updated_at ON public.programmes;
DROP TRIGGER IF EXISTS trg_programmes_set_updated_at ON public.programmes;
CREATE TRIGGER trg_programmes_set_updated_at
  BEFORE UPDATE ON public.programmes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS cohorts_updated_at ON public.cohorts;
DROP TRIGGER IF EXISTS trg_cohorts_set_updated_at ON public.cohorts;
CREATE TRIGGER trg_cohorts_set_updated_at
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS class_groups_updated_at ON public.class_groups;
DROP TRIGGER IF EXISTS trg_class_groups_set_updated_at ON public.class_groups;
CREATE TRIGGER trg_class_groups_set_updated_at
  BEFORE UPDATE ON public.class_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS staff_scopes_updated_at ON public.institution_staff_scopes;
DROP TRIGGER IF EXISTS trg_institution_staff_scopes_set_updated_at ON public.institution_staff_scopes;
CREATE TRIGGER trg_institution_staff_scopes_set_updated_at
  BEFORE UPDATE ON public.institution_staff_scopes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS classrooms_updated_at ON public.classrooms;
DROP TRIGGER IF EXISTS trg_classrooms_set_updated_at ON public.classrooms;
CREATE TRIGGER trg_classrooms_set_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS classroom_members_updated_at ON public.classroom_members;
DROP TRIGGER IF EXISTS trg_classroom_members_set_updated_at ON public.classroom_members;
CREATE TRIGGER trg_classroom_members_set_updated_at
  BEFORE UPDATE ON public.classroom_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS inst_settings_updated_at ON public.institution_settings;
DROP TRIGGER IF EXISTS trg_institution_settings_set_updated_at ON public.institution_settings;
CREATE TRIGGER trg_institution_settings_set_updated_at
  BEFORE UPDATE ON public.institution_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS quotas_updated_at ON public.institution_quotas_usage;
DROP TRIGGER IF EXISTS trg_institution_quotas_usage_set_updated_at ON public.institution_quotas_usage;
CREATE TRIGGER trg_institution_quotas_usage_set_updated_at
  BEFORE UPDATE ON public.institution_quotas_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS invoice_records_updated_at ON public.institution_invoice_records;
DROP TRIGGER IF EXISTS trg_institution_invoice_records_set_updated_at ON public.institution_invoice_records;
CREATE TRIGGER trg_institution_invoice_records_set_updated_at
  BEFORE UPDATE ON public.institution_invoice_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS dsr_updated_at ON public.data_subject_requests;
DROP TRIGGER IF EXISTS trg_data_subject_requests_set_updated_at ON public.data_subject_requests;
CREATE TRIGGER trg_data_subject_requests_set_updated_at
  BEFORE UPDATE ON public.data_subject_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
