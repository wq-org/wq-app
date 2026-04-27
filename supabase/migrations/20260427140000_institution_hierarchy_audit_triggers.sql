-- =============================================================================
-- INSTITUTION AUDIT COVERAGE — hierarchy/classroom/offering triggers
-- =============================================================================
-- Purpose
--   Adds audit trigger functions for hierarchy and scheduling tables and binds
--   AFTER INSERT/UPDATE/DELETE row-level triggers so changes are written to
--   `audit.events` through `audit.log_event(...)`.
--
-- Prerequisites (must already exist before this migration runs)
--   - Schema/function: `audit.log_event(...)`
--   - Target tables:
--       `public.faculties`
--       `public.programmes`
--       `public.cohorts`
--       `public.class_groups`
--       `public.programme_offerings`
--       `public.cohort_offerings`
--       `public.class_group_offerings`
--       `public.classrooms`
--   - Expected table columns used by the trigger code:
--       Common keys: `id`, `institution_id`
--       Soft-delete/timestamps/status fields as referenced in each function
--       (e.g. `deleted_at`, `status`, `starts_at`, `ends_at`, etc.)
--
-- Execution / ordering notes
--   - Run after base schema creation for all listed tables.
--   - Run after the migration that creates the audit schema helper functions.
--   - Safe to re-run: uses `CREATE OR REPLACE FUNCTION` + `DROP TRIGGER IF EXISTS`.
--
-- Runtime behavior
--   - Emits domain-specific `event_type` values (created/updated/deleted, plus
--     lifecycle events like soft_deleted/archived).
--   - Skips no-op UPDATEs (when tracked fields did not actually change).
--   - Writes `payload` and `metadata.context` to support institution-admin audit
--     views and filters.

CREATE OR REPLACE FUNCTION audit.log_faculties_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'faculty.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'faculty.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'faculty.soft_deleted';
    ELSIF NOT (
      NEW.name IS DISTINCT FROM OLD.name
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.sort_order IS DISTINCT FROM OLD.sort_order
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'faculty.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'faculty',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.name, OLD.name),
      'soft_deleted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'faculty_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_faculties_audit_row ON public.faculties;
CREATE TRIGGER trg_faculties_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.faculties
  FOR EACH ROW EXECUTE FUNCTION audit.log_faculties_audit();

CREATE OR REPLACE FUNCTION audit.log_programmes_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'programme.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'programme.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'programme.soft_deleted';
    ELSIF NOT (
      NEW.faculty_id IS DISTINCT FROM OLD.faculty_id
      OR NEW.name IS DISTINCT FROM OLD.name
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.duration_years IS DISTINCT FROM OLD.duration_years
      OR NEW.progression_type IS DISTINCT FROM OLD.progression_type
      OR NEW.sort_order IS DISTINCT FROM OLD.sort_order
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'programme.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'programme',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.name, OLD.name),
      'status', CASE WHEN (CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END) IS NULL THEN 'active' ELSE 'soft_deleted' END,
      'parent_ids', jsonb_build_object('faculty_id', COALESCE(NEW.faculty_id, OLD.faculty_id)),
      'soft_deleted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'faculty_id', COALESCE(NEW.faculty_id, OLD.faculty_id),
        'programme_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_programmes_audit_row ON public.programmes;
CREATE TRIGGER trg_programmes_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.programmes
  FOR EACH ROW EXECUTE FUNCTION audit.log_programmes_audit();

CREATE OR REPLACE FUNCTION audit.log_cohorts_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'cohort.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'cohort.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'cohort.soft_deleted';
    ELSIF NOT (
      NEW.programme_id IS DISTINCT FROM OLD.programme_id
      OR NEW.name IS DISTINCT FROM OLD.name
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.academic_year IS DISTINCT FROM OLD.academic_year
      OR NEW.sort_order IS DISTINCT FROM OLD.sort_order
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'cohort.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'cohort',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.name, OLD.name),
      'academic_year', COALESCE(NEW.academic_year, OLD.academic_year),
      'status', CASE WHEN (CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END) IS NULL THEN 'active' ELSE 'soft_deleted' END,
      'parent_ids', jsonb_build_object('programme_id', COALESCE(NEW.programme_id, OLD.programme_id)),
      'soft_deleted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'programme_id', COALESCE(NEW.programme_id, OLD.programme_id),
        'cohort_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_cohorts_audit_row ON public.cohorts;
CREATE TRIGGER trg_cohorts_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION audit.log_cohorts_audit();

CREATE OR REPLACE FUNCTION audit.log_class_groups_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'class_group.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'class_group.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'class_group.soft_deleted';
    ELSIF NOT (
      NEW.cohort_id IS DISTINCT FROM OLD.cohort_id
      OR NEW.name IS DISTINCT FROM OLD.name
      OR NEW.description IS DISTINCT FROM OLD.description
      OR NEW.sort_order IS DISTINCT FROM OLD.sort_order
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'class_group.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'class_group',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.name, OLD.name),
      'status', CASE WHEN (CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END) IS NULL THEN 'active' ELSE 'soft_deleted' END,
      'parent_ids', jsonb_build_object('cohort_id', COALESCE(NEW.cohort_id, OLD.cohort_id)),
      'soft_deleted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'cohort_id', COALESCE(NEW.cohort_id, OLD.cohort_id),
        'class_group_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_class_groups_audit_row ON public.class_groups;
CREATE TRIGGER trg_class_groups_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.class_groups
  FOR EACH ROW EXECUTE FUNCTION audit.log_class_groups_audit();

CREATE OR REPLACE FUNCTION audit.log_programme_offerings_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'programme_offering.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'programme_offering.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'programme_offering.soft_deleted';
    ELSIF NEW.status = 'archived' AND OLD.status IS DISTINCT FROM NEW.status THEN
      v_event_type := 'programme_offering.archived';
    ELSIF NOT (
      NEW.programme_id IS DISTINCT FROM OLD.programme_id
      OR NEW.academic_year IS DISTINCT FROM OLD.academic_year
      OR NEW.term_code IS DISTINCT FROM OLD.term_code
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
      OR NEW.ends_at IS DISTINCT FROM OLD.ends_at
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'programme_offering.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'programme_offering',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.term_code, OLD.term_code, COALESCE(NEW.academic_year, OLD.academic_year)::text),
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE NEW.status END,
      'parent_ids', jsonb_build_object('programme_id', COALESCE(NEW.programme_id, OLD.programme_id)),
      'starts_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.starts_at ELSE NEW.starts_at END,
      'ends_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ends_at ELSE NEW.ends_at END,
      'soft_deleted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'programme_id', COALESCE(NEW.programme_id, OLD.programme_id),
        'programme_offering_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_programme_offerings_audit_row ON public.programme_offerings;
CREATE TRIGGER trg_programme_offerings_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.programme_offerings
  FOR EACH ROW EXECUTE FUNCTION audit.log_programme_offerings_audit();

CREATE OR REPLACE FUNCTION audit.log_cohort_offerings_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'cohort_offering.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'cohort_offering.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'cohort_offering.soft_deleted';
    ELSIF NEW.status = 'archived' AND OLD.status IS DISTINCT FROM NEW.status THEN
      v_event_type := 'cohort_offering.archived';
    ELSIF NOT (
      NEW.programme_offering_id IS DISTINCT FROM OLD.programme_offering_id
      OR NEW.cohort_id IS DISTINCT FROM OLD.cohort_id
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
      OR NEW.ends_at IS DISTINCT FROM OLD.ends_at
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'cohort_offering.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'cohort_offering',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.id, OLD.id)::text,
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE NEW.status END,
      'parent_ids', jsonb_build_object(
        'programme_offering_id', COALESCE(NEW.programme_offering_id, OLD.programme_offering_id),
        'cohort_id', COALESCE(NEW.cohort_id, OLD.cohort_id)
      ),
      'starts_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.starts_at ELSE NEW.starts_at END,
      'ends_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ends_at ELSE NEW.ends_at END,
      'soft_deleted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'programme_offering_id', COALESCE(NEW.programme_offering_id, OLD.programme_offering_id),
        'cohort_id', COALESCE(NEW.cohort_id, OLD.cohort_id),
        'cohort_offering_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_cohort_offerings_audit_row ON public.cohort_offerings;
CREATE TRIGGER trg_cohort_offerings_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.cohort_offerings
  FOR EACH ROW EXECUTE FUNCTION audit.log_cohort_offerings_audit();

CREATE OR REPLACE FUNCTION audit.log_class_group_offerings_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'class_group_offering.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'class_group_offering.deleted';
  ELSE
    IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
      v_event_type := 'class_group_offering.soft_deleted';
    ELSIF NEW.status = 'archived' AND OLD.status IS DISTINCT FROM NEW.status THEN
      v_event_type := 'class_group_offering.archived';
    ELSIF NOT (
      NEW.cohort_offering_id IS DISTINCT FROM OLD.cohort_offering_id
      OR NEW.class_group_id IS DISTINCT FROM OLD.class_group_id
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.starts_at IS DISTINCT FROM OLD.starts_at
      OR NEW.ends_at IS DISTINCT FROM OLD.ends_at
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'class_group_offering.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'class_group_offering',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.id, OLD.id)::text,
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE NEW.status END,
      'parent_ids', jsonb_build_object(
        'cohort_offering_id', COALESCE(NEW.cohort_offering_id, OLD.cohort_offering_id),
        'class_group_id', COALESCE(NEW.class_group_id, OLD.class_group_id)
      ),
      'starts_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.starts_at ELSE NEW.starts_at END,
      'ends_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.ends_at ELSE NEW.ends_at END,
      'soft_deleted_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deleted_at ELSE NEW.deleted_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'cohort_offering_id', COALESCE(NEW.cohort_offering_id, OLD.cohort_offering_id),
        'class_group_id', COALESCE(NEW.class_group_id, OLD.class_group_id),
        'class_group_offering_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_class_group_offerings_audit_row ON public.class_group_offerings;
CREATE TRIGGER trg_class_group_offerings_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.class_group_offerings
  FOR EACH ROW EXECUTE FUNCTION audit.log_class_group_offerings_audit();

CREATE OR REPLACE FUNCTION audit.log_classrooms_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'classroom.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'classroom.deleted';
  ELSE
    IF NEW.status = 'inactive' AND OLD.status IS DISTINCT FROM NEW.status THEN
      v_event_type := 'classroom.archived';
    ELSIF NOT (
      NEW.class_group_id IS DISTINCT FROM OLD.class_group_id
      OR NEW.class_group_offering_id IS DISTINCT FROM OLD.class_group_offering_id
      OR NEW.primary_teacher_id IS DISTINCT FROM OLD.primary_teacher_id
      OR NEW.title IS DISTINCT FROM OLD.title
      OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.deactivated_at IS DISTINCT FROM OLD.deactivated_at
    ) THEN
      RETURN NEW;
    ELSE
      v_event_type := 'classroom.updated';
    END IF;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'classroom',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'display_name', COALESCE(NEW.title, OLD.title),
      'status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE NEW.status END,
      'parent_ids', jsonb_build_object(
        'class_group_id', COALESCE(NEW.class_group_id, OLD.class_group_id),
        'class_group_offering_id', COALESCE(NEW.class_group_offering_id, OLD.class_group_offering_id)
      ),
      'primary_teacher_id', COALESCE(NEW.primary_teacher_id, OLD.primary_teacher_id),
      'deactivated_at', CASE WHEN TG_OP = 'DELETE' THEN OLD.deactivated_at ELSE NEW.deactivated_at END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'class_group_id', COALESCE(NEW.class_group_id, OLD.class_group_id),
        'class_group_offering_id', COALESCE(NEW.class_group_offering_id, OLD.class_group_offering_id),
        'classroom_id', COALESCE(NEW.id, OLD.id)
      )
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_classrooms_audit_row ON public.classrooms;
CREATE TRIGGER trg_classrooms_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION audit.log_classrooms_audit();
