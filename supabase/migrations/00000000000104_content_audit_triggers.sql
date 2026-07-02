-- =============================================================================
-- CONTENT AUDIT COVERAGE — courses, games + game_versions (game studio).
--
-- Closes the audit gap for content lifecycle + soft-delete on the core domains.
-- Follows docs/architecture/principle_dsgvo_audit_datendefinition.md:
--   * payload is allowlist-only: IDs, status/lifecycle flags, changed_fields
--   * NO free-text (title/description/message content) is ever logged
--   * metadata.visibility_level = 'institution_admin'
--   * actor resolved server-side inside audit.log_event() (never a param)
--   * soft-delete (deleted_at NULL -> timestamp) emits a *.deleted event;
--     archive (archived_at) emits *.archived
-- Requires: audit.log_event() (super_admin_04) and the target domain tables.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- courses
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.log_courses_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'course.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'course.deleted';
  ELSIF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    v_event_type := 'course.deleted';
  ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    v_event_type := 'course.restored';
  ELSIF NEW.is_published IS DISTINCT FROM OLD.is_published THEN
    v_event_type := CASE WHEN NEW.is_published THEN 'course.published' ELSE 'course.unpublished' END;
  ELSE
    RETURN NEW;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'course',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'is_published', CASE WHEN TG_OP = 'DELETE' THEN OLD.is_published ELSE NEW.is_published END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object('course_id', COALESCE(NEW.id, OLD.id))
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_courses_audit_row ON public.courses;
CREATE TRIGGER trg_courses_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION audit.log_courses_audit();

-- -----------------------------------------------------------------------------
-- games (game studio)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.log_games_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'game.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'game.deleted';
  ELSIF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    v_event_type := 'game.deleted';
  ELSIF NEW.deleted_at IS NULL AND OLD.deleted_at IS NOT NULL THEN
    v_event_type := 'game.restored';
  ELSIF NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
    v_event_type := 'game.archived';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    v_event_type := CASE WHEN NEW.status::text = 'published' THEN 'game.published' ELSE 'game.status_changed' END;
  ELSE
    RETURN NEW;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'game',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status::text ELSE NULL END,
      'new_status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status::text ELSE NEW.status::text END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'game_id', COALESCE(NEW.id, OLD.id),
        'course_id', CASE WHEN TG_OP = 'DELETE' THEN OLD.course_id ELSE NEW.course_id END
      )
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_games_audit_row ON public.games;
CREATE TRIGGER trg_games_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.games
  FOR EACH ROW EXECUTE FUNCTION audit.log_games_audit();

-- -----------------------------------------------------------------------------
-- game_versions (immutable publish lineage)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit.log_game_versions_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_type := 'game_version.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_event_type := 'game_version.deleted';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    v_event_type := CASE WHEN NEW.status = 'published' THEN 'game_version.published' ELSE 'game_version.status_changed' END;
  ELSE
    RETURN NEW;
  END IF;

  PERFORM audit.log_event(
    p_event_type := v_event_type,
    p_subject_type := 'game_version',
    p_subject_id := COALESCE(NEW.id, OLD.id),
    p_institution_id := COALESCE(NEW.institution_id, OLD.institution_id),
    p_payload := jsonb_build_object(
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
      'new_status', CASE WHEN TG_OP = 'DELETE' THEN OLD.status ELSE NEW.status END
    ),
    p_metadata := jsonb_build_object(
      'visibility_level', 'institution_admin',
      'context', jsonb_build_object(
        'game_version_id', COALESCE(NEW.id, OLD.id),
        'game_id', COALESCE(NEW.game_id, OLD.game_id)
      )
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_game_versions_audit_row ON public.game_versions;
CREATE TRIGGER trg_game_versions_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.game_versions
  FOR EACH ROW EXECUTE FUNCTION audit.log_game_versions_audit();
