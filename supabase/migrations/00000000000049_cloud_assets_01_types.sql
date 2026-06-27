-- =============================================================================
-- CLOUD ASSETS — types
-- Requires: 20260321000002_institution_admin (all parts),
--           20260323000002_classroom_course_links_lesson_progress (all parts),
--           20260326000003_game_versions (all parts)
-- =============================================================================

DO $$
BEGIN
  CREATE TYPE public.cloud_file_scope AS ENUM (
    'personal',
    'classroom',
    'course',
    'lesson',
    'game',
    'institution'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.cloud_file_scope IS
  'Access domain for cloud files and folders; drives RLS alongside links and shares.';

DO $$
BEGIN
  CREATE TYPE public.cloud_file_status AS ENUM (
    'active',
    'deleted',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.cloud_file_status IS
  'Lifecycle: active in use; deleted soft-remove; archived retained but hidden from default UI.';

DO $$
BEGIN
  CREATE TYPE public.cloud_file_link_entity_type AS ENUM (
    'lesson',
    'note',
    'message',
    'game_version',
    'classroom',
    'course'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.cloud_file_link_entity_type IS
  'Polymorphic link target; entity_id is the primary key of the named table.';

DO $$
BEGIN
  CREATE TYPE public.cloud_file_link_purpose AS ENUM (
    'attachment',
    'cover',
    'inline_media',
    'source_pdf'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.cloud_file_link_purpose IS
  'Why the file is attached to the product entity.';

DO $$
BEGIN
  CREATE TYPE public.cloud_file_share_permission AS ENUM (
    'read',
    'edit'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

COMMENT ON TYPE public.cloud_file_share_permission IS
  'Direct share grant: read-only vs collaborative edit.';
