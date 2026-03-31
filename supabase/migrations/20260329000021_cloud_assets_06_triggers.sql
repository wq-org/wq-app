-- =============================================================================
-- CLOUD ASSETS — triggers
-- Requires: 20260329000020_cloud_assets_05_backfills_seed
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger functions
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_cloud_file_from_folder()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  folder_row public.cloud_folders%ROWTYPE;
BEGIN
  IF NEW.folder_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT *
  INTO folder_row
  FROM public.cloud_folders
  WHERE id = NEW.folder_id;

  IF folder_row.id IS NULL THEN
    RAISE EXCEPTION 'cloud file folder not found';
  END IF;

  IF folder_row.institution_id IS DISTINCT FROM NEW.institution_id THEN
    RAISE EXCEPTION 'cloud file institution must match folder institution';
  END IF;

  NEW.scope := folder_row.scope;
  NEW.classroom_id := folder_row.classroom_id;
  NEW.course_id := folder_row.course_id;
  NEW.lesson_id := folder_row.lesson_id;
  NEW.task_id := folder_row.task_id;
  NEW.conversation_id := folder_row.conversation_id;
  NEW.game_version_id := folder_row.game_version_id;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_cloud_file_from_folder() FROM public;

CREATE OR REPLACE FUNCTION public.validate_cloud_folder_tree()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  parent_id uuid;
  depth integer := 0;
  parent_row public.cloud_folders%ROWTYPE;
BEGIN
  IF NEW.parent_folder_id IS NULL THEN
    RETURN NEW;
  END IF;

  parent_id := NEW.parent_folder_id;

  WHILE parent_id IS NOT NULL AND depth < 64 LOOP
    IF parent_id = NEW.id THEN
      RAISE EXCEPTION 'cloud folder parent cycle detected';
    END IF;

    SELECT *
    INTO parent_row
    FROM public.cloud_folders
    WHERE id = parent_id;

    IF parent_row.id IS NULL THEN
      RAISE EXCEPTION 'cloud folder parent not found';
    END IF;

    IF parent_row.institution_id IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud folder parent must be same institution';
    END IF;

    parent_id := parent_row.parent_folder_id;
    depth := depth + 1;
  END LOOP;

  IF depth >= 64 THEN
    RAISE EXCEPTION 'cloud folder nesting depth exceeded';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_cloud_folder_tree() FROM public;

CREATE OR REPLACE FUNCTION public.validate_cloud_files_institution_coherence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  c_inst uuid;
  t_inst uuid;
  conv_inst uuid;
  gv_inst uuid;
  course_from_lesson uuid;
BEGIN
  IF NEW.course_id IS NOT NULL THEN
    SELECT c.institution_id
    INTO c_inst
    FROM public.courses c
    WHERE c.id = NEW.course_id;

    IF c_inst IS NOT NULL AND c_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud file course institution mismatch';
    END IF;
  END IF;

  IF NEW.lesson_id IS NOT NULL THEN
    SELECT c.institution_id
    INTO course_from_lesson
    FROM public.lessons l
    JOIN public.topics top ON top.id = l.topic_id
    JOIN public.courses c ON c.id = top.course_id
    WHERE l.id = NEW.lesson_id;

    IF course_from_lesson IS NOT NULL AND course_from_lesson IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud file lesson institution mismatch';
    END IF;
  END IF;

  IF NEW.task_id IS NOT NULL THEN
    SELECT td.institution_id
    INTO t_inst
    FROM public.task_deliveries td
    WHERE td.id = NEW.task_id;

    IF t_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud file task institution mismatch';
    END IF;
  END IF;

  IF NEW.conversation_id IS NOT NULL THEN
    SELECT conv.institution_id
    INTO conv_inst
    FROM public.conversations conv
    WHERE conv.id = NEW.conversation_id;

    IF conv_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud file conversation institution mismatch';
    END IF;
  END IF;

  IF NEW.game_version_id IS NOT NULL THEN
    SELECT gv.institution_id
    INTO gv_inst
    FROM public.game_versions gv
    WHERE gv.id = NEW.game_version_id;

    IF gv_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud file game version institution mismatch';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_cloud_files_institution_coherence() FROM public;

CREATE OR REPLACE FUNCTION public.validate_cloud_folders_institution_coherence()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  c_inst uuid;
  course_from_lesson uuid;
  t_inst uuid;
  conv_inst uuid;
  gv_inst uuid;
BEGIN
  IF NEW.course_id IS NOT NULL THEN
    SELECT c.institution_id
    INTO c_inst
    FROM public.courses c
    WHERE c.id = NEW.course_id;

    IF c_inst IS NOT NULL AND c_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud folder course institution mismatch';
    END IF;
  END IF;

  IF NEW.lesson_id IS NOT NULL THEN
    SELECT c.institution_id
    INTO course_from_lesson
    FROM public.lessons l
    JOIN public.topics top ON top.id = l.topic_id
    JOIN public.courses c ON c.id = top.course_id
    WHERE l.id = NEW.lesson_id;

    IF course_from_lesson IS NOT NULL AND course_from_lesson IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud folder lesson institution mismatch';
    END IF;
  END IF;

  IF NEW.task_id IS NOT NULL THEN
    SELECT td.institution_id
    INTO t_inst
    FROM public.task_deliveries td
    WHERE td.id = NEW.task_id;

    IF t_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud folder task institution mismatch';
    END IF;
  END IF;

  IF NEW.conversation_id IS NOT NULL THEN
    SELECT conv.institution_id
    INTO conv_inst
    FROM public.conversations conv
    WHERE conv.id = NEW.conversation_id;

    IF conv_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud folder conversation institution mismatch';
    END IF;
  END IF;

  IF NEW.game_version_id IS NOT NULL THEN
    SELECT gv.institution_id
    INTO gv_inst
    FROM public.game_versions gv
    WHERE gv.id = NEW.game_version_id;

    IF gv_inst IS DISTINCT FROM NEW.institution_id THEN
      RAISE EXCEPTION 'cloud folder game version institution mismatch';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_cloud_folders_institution_coherence() FROM public;

CREATE OR REPLACE FUNCTION public.sync_cloud_file_links_institution_from_file()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  file_inst uuid;
BEGIN
  SELECT institution_id
  INTO file_inst
  FROM public.cloud_files
  WHERE id = NEW.cloud_file_id;

  IF file_inst IS NULL THEN
    RAISE EXCEPTION 'cloud file link references missing file';
  END IF;

  IF NEW.institution_id IS DISTINCT FROM file_inst THEN
    NEW.institution_id := file_inst;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_cloud_file_links_institution_from_file() FROM public;

-- -----------------------------------------------------------------------------
-- updated_at
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_cloud_folders_set_updated_at ON public.cloud_folders;
CREATE TRIGGER trg_cloud_folders_set_updated_at
  BEFORE UPDATE ON public.cloud_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_cloud_files_set_updated_at ON public.cloud_files;
CREATE TRIGGER trg_cloud_files_set_updated_at
  BEFORE UPDATE ON public.cloud_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_cloud_file_links_set_updated_at ON public.cloud_file_links;
CREATE TRIGGER trg_cloud_file_links_set_updated_at
  BEFORE UPDATE ON public.cloud_file_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_cloud_file_shares_set_updated_at ON public.cloud_file_shares;
CREATE TRIGGER trg_cloud_file_shares_set_updated_at
  BEFORE UPDATE ON public.cloud_file_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- Integrity triggers (order: normalize file from folder before institution checks)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_cloud_files_normalize_from_folder ON public.cloud_files;
CREATE TRIGGER trg_cloud_files_normalize_from_folder
  BEFORE INSERT OR UPDATE OF folder_id ON public.cloud_files
  FOR EACH ROW EXECUTE FUNCTION public.normalize_cloud_file_from_folder();

DROP TRIGGER IF EXISTS trg_cloud_files_validate_institution ON public.cloud_files;
CREATE TRIGGER trg_cloud_files_validate_institution
  BEFORE INSERT OR UPDATE ON public.cloud_files
  FOR EACH ROW EXECUTE FUNCTION public.validate_cloud_files_institution_coherence();

DROP TRIGGER IF EXISTS trg_cloud_folders_validate_tree ON public.cloud_folders;
CREATE TRIGGER trg_cloud_folders_validate_tree
  BEFORE INSERT OR UPDATE ON public.cloud_folders
  FOR EACH ROW EXECUTE FUNCTION public.validate_cloud_folder_tree();

DROP TRIGGER IF EXISTS trg_cloud_folders_validate_institution ON public.cloud_folders;
CREATE TRIGGER trg_cloud_folders_validate_institution
  BEFORE INSERT OR UPDATE ON public.cloud_folders
  FOR EACH ROW EXECUTE FUNCTION public.validate_cloud_folders_institution_coherence();

DROP TRIGGER IF EXISTS trg_cloud_file_links_sync_institution ON public.cloud_file_links;
CREATE TRIGGER trg_cloud_file_links_sync_institution
  BEFORE INSERT OR UPDATE OF cloud_file_id ON public.cloud_file_links
  FOR EACH ROW EXECUTE FUNCTION public.sync_cloud_file_links_institution_from_file();

-- -----------------------------------------------------------------------------
-- Quota maintenance (after row visible to concurrent readers)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_cloud_files_quota_usage ON public.cloud_files;
CREATE TRIGGER trg_cloud_files_quota_usage
  AFTER INSERT OR DELETE OR UPDATE OF size_bytes, status ON public.cloud_files
  FOR EACH ROW EXECUTE FUNCTION public.apply_cloud_file_storage_quota_delta();
