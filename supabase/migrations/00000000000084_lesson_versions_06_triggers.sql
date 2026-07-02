-- =============================================================================
-- LESSON VERSIONS — 06_triggers
-- Updated_at trigger, immutability enforcement, course pending marker, audit.
-- docs/architecture/principle_database.md: triggers for integrity; SECURITY DEFINER
-- functions use pinned search_path; audit.events uses binding contract fields.
-- =============================================================================

-- Trigger functions cannot take declared arguments; use TG_TABLE_NAME / NEW inside.

DROP FUNCTION IF EXISTS public.mark_linked_courses_pending(uuid);

-- =============================================================================
-- Immutability: block updates to published snapshot columns
-- =============================================================================

CREATE OR REPLACE FUNCTION public.raise_immutable_violation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'table % is immutable after creation', TG_TABLE_NAME;
END;
$$;

COMMENT ON FUNCTION public.raise_immutable_violation() IS
  'BEFORE UPDATE trigger: rejects changes to immutable published snapshot columns on lesson_versions.';

-- =============================================================================
-- Mark linked course_versions as having pending changes when major lesson version published
-- =============================================================================

CREATE OR REPLACE FUNCTION public.mark_linked_courses_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.course_versions cv
  SET has_pending_changes = TRUE
  WHERE cv.id IN (
    SELECT DISTINCT cvt.course_version_id
    FROM public.course_version_topics cvt
    JOIN public.course_version_lessons cvl
      ON cvl.course_version_topic_id = cvt.id
    WHERE cvl.source_lesson_id = NEW.lesson_id
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_linked_courses_pending() FROM PUBLIC;

COMMENT ON FUNCTION public.mark_linked_courses_pending() IS
  'SECURITY DEFINER trigger: marks course_versions containing this lesson as pending when a major lesson version is published. search_path pinned; no RLS bypass beyond the bounded UPDATE.';

-- =============================================================================
-- Audit lesson version disable/soft-revert
-- =============================================================================

CREATE OR REPLACE FUNCTION public.audit_lesson_version_disabled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, audit, pg_temp
AS $$
BEGIN
  PERFORM audit.log_event(
    p_event_type := 'lesson_version.disabled',
    p_subject_type := 'lesson_version',
    p_subject_id := NEW.id,
    p_institution_id := NEW.institution_id,
    p_payload := jsonb_build_object(
      'reason', 'patch_revoked_or_deprecated'
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'lesson_id', NEW.lesson_id,
        'version_major', NEW.version_major,
        'version_patch', NEW.version_patch
      )
    )
  );

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.audit_lesson_version_disabled() IS
  'SECURITY DEFINER audit trigger: writes audit.events via audit.log_event (principle_dsgvo_audit_datendefinition.md).';

-- =============================================================================
-- Triggers on public.lesson_versions
-- =============================================================================

DROP TRIGGER IF EXISTS trg_lesson_versions_set_updated_at ON public.lesson_versions;
CREATE TRIGGER trg_lesson_versions_set_updated_at
  BEFORE UPDATE ON public.lesson_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_lesson_versions_prevent_content_update ON public.lesson_versions;
CREATE TRIGGER trg_lesson_versions_prevent_content_update
  BEFORE UPDATE ON public.lesson_versions
  FOR EACH ROW
  WHEN (OLD.lexical_state IS DISTINCT FROM NEW.lexical_state
     OR OLD.change_kind IS DISTINCT FROM NEW.change_kind
     OR OLD.published_by IS DISTINCT FROM NEW.published_by
     OR OLD.published_at IS DISTINCT FROM NEW.published_at)
  EXECUTE FUNCTION public.raise_immutable_violation();

DROP TRIGGER IF EXISTS trg_lesson_versions_mark_course_pending ON public.lesson_versions;
CREATE TRIGGER trg_lesson_versions_mark_course_pending
  AFTER INSERT ON public.lesson_versions
  FOR EACH ROW
  WHEN (NEW.change_kind IN ('structural_major', 'assessment_major'))
  EXECUTE FUNCTION public.mark_linked_courses_pending();

DROP TRIGGER IF EXISTS trg_lesson_versions_audit_disable ON public.lesson_versions;
CREATE TRIGGER trg_lesson_versions_audit_disable
  BEFORE UPDATE ON public.lesson_versions
  FOR EACH ROW
  WHEN (OLD.is_active IS TRUE AND NEW.is_active IS FALSE)
  EXECUTE FUNCTION public.audit_lesson_version_disabled();
