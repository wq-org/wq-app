-- =============================================================================
-- INSTITUTION ADMIN — Triggers
-- Core tenant tables only (hierarchy removed for the Hetzner minimal core).
-- Requires: 20260000000002_super_admin, 20260321000001_super_admin (all 8 parts)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.trg_fn_institutions_auto_admin_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF v_actor_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = v_actor_id
      AND (p.role = 'super_admin' OR p.is_super_admin IS TRUE)
  ) THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = v_actor_id
  ) THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.institution_memberships m
    WHERE m.user_id = v_actor_id
      AND m.institution_id = NEW.id
      AND m.deleted_at IS NULL
  ) THEN
    INSERT INTO public.institution_memberships (
      user_id,
      institution_id,
      membership_role,
      status
    )
    VALUES (
      v_actor_id,
      NEW.id,
      'institution_admin'::public.membership_role,
      'active'::public.membership_status
    );
  END IF;

  INSERT INTO public.user_institutions (user_id, institution_id)
  VALUES (v_actor_id, NEW.id)
  ON CONFLICT (user_id, institution_id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trg_fn_institutions_auto_admin_membership() IS
  'After a new institution row is created, auto-inserts institution_admin membership for the authenticated non-platform actor (auth.uid()). Skips super_admin / is_super_admin profiles, service-role contexts (auth.uid() IS NULL), and when a membership already exists.';

DROP TRIGGER IF EXISTS trg_institutions_auto_admin_membership ON public.institutions;
CREATE TRIGGER trg_institutions_auto_admin_membership
  AFTER INSERT ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_institutions_auto_admin_membership();

DROP TRIGGER IF EXISTS memberships_updated_at ON public.institution_memberships;
DROP TRIGGER IF EXISTS trg_institution_memberships_set_updated_at ON public.institution_memberships;
CREATE TRIGGER trg_institution_memberships_set_updated_at
  BEFORE UPDATE ON public.institution_memberships
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
