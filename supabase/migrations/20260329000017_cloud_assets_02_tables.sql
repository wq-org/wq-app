-- =============================================================================
-- CLOUD ASSETS — tables
-- Requires: 20260329000016_cloud_assets_01_types
-- =============================================================================

-- =============================================================================
-- cloud_folders — hierarchical organization (Drive-like)
-- =============================================================================
CREATE TABLE public.cloud_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES public.cloud_folders (id) ON DELETE CASCADE,
  scope public.cloud_file_scope NOT NULL,
  classroom_id uuid,
  course_id uuid,
  lesson_id uuid REFERENCES public.lessons (id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.task_deliveries (id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations (id) ON DELETE CASCADE,
  game_version_id uuid REFERENCES public.game_versions (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  CONSTRAINT chk_cloud_folders_name_not_empty
    CHECK (length(trim(name)) > 0),
  CONSTRAINT fk_cloud_folders_classrooms
    FOREIGN KEY (classroom_id, institution_id)
    REFERENCES public.classrooms (id, institution_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cloud_folders_courses
    FOREIGN KEY (course_id)
    REFERENCES public.courses (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_cloud_folders_scope_anchors CHECK (
    (
      scope = 'personal'::public.cloud_file_scope
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'institution'::public.cloud_file_scope
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'classroom'::public.cloud_file_scope
      AND classroom_id IS NOT NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'course'::public.cloud_file_scope
      AND course_id IS NOT NULL
      AND classroom_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'lesson'::public.cloud_file_scope
      AND lesson_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'task'::public.cloud_file_scope
      AND task_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'game'::public.cloud_file_scope
      AND game_version_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
    )
    OR (
      scope = 'chat'::public.cloud_file_scope
      AND conversation_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND game_version_id IS NULL
    )
  )
);

COMMENT ON TABLE public.cloud_folders IS
  'Nested folders for institution-scoped cloud files; scope defines default access for files inside.';
COMMENT ON COLUMN public.cloud_folders.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.cloud_folders.owner_user_id IS 'User that created the folder.';
COMMENT ON COLUMN public.cloud_folders.parent_folder_id IS 'Parent folder; NULL = root.';
COMMENT ON COLUMN public.cloud_folders.scope IS 'Access domain; anchor FKs must match scope.';

-- =============================================================================
-- cloud_files — object metadata (bytes live in Storage)
-- =============================================================================
CREATE TABLE public.cloud_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.cloud_folders (id) ON DELETE SET NULL,
  bucket text NOT NULL DEFAULT 'cloud',
  storage_object_name text NOT NULL,
  scope public.cloud_file_scope NOT NULL,
  classroom_id uuid,
  course_id uuid,
  lesson_id uuid REFERENCES public.lessons (id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.task_deliveries (id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations (id) ON DELETE CASCADE,
  game_version_id uuid REFERENCES public.game_versions (id) ON DELETE CASCADE,
  mime_type text,
  size_bytes bigint NOT NULL DEFAULT 0,
  original_name text,
  status public.cloud_file_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  CONSTRAINT uq_cloud_files_bucket_storage_object_name UNIQUE (bucket, storage_object_name),
  CONSTRAINT chk_cloud_files_size_bytes_non_negative
    CHECK (size_bytes >= 0),
  CONSTRAINT fk_cloud_files_classrooms
    FOREIGN KEY (classroom_id, institution_id)
    REFERENCES public.classrooms (id, institution_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cloud_files_courses
    FOREIGN KEY (course_id)
    REFERENCES public.courses (id)
    ON DELETE CASCADE,
  CONSTRAINT chk_cloud_files_scope_anchors CHECK (
    (
      scope = 'personal'::public.cloud_file_scope
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'institution'::public.cloud_file_scope
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'classroom'::public.cloud_file_scope
      AND classroom_id IS NOT NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'course'::public.cloud_file_scope
      AND course_id IS NOT NULL
      AND classroom_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'lesson'::public.cloud_file_scope
      AND lesson_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'task'::public.cloud_file_scope
      AND task_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND conversation_id IS NULL
      AND game_version_id IS NULL
    )
    OR (
      scope = 'game'::public.cloud_file_scope
      AND game_version_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND conversation_id IS NULL
    )
    OR (
      scope = 'chat'::public.cloud_file_scope
      AND conversation_id IS NOT NULL
      AND classroom_id IS NULL
      AND course_id IS NULL
      AND lesson_id IS NULL
      AND task_id IS NULL
      AND game_version_id IS NULL
    )
  )
);

COMMENT ON TABLE public.cloud_files IS
  'Metadata for a Storage object; RLS and scopes define who may read or manage it.';
COMMENT ON COLUMN public.cloud_files.institution_id IS 'Tenant boundary.';
COMMENT ON COLUMN public.cloud_files.bucket IS 'Supabase Storage bucket id (default cloud).';
COMMENT ON COLUMN public.cloud_files.storage_object_name IS 'Object key within the bucket; canonical layout {institution_id}/files/{file_id}.';
COMMENT ON COLUMN public.cloud_files.size_bytes IS 'Byte size for quota accounting; keep in sync with uploaded object.';

-- =============================================================================
-- cloud_file_links — attach files to product entities
-- =============================================================================
CREATE TABLE public.cloud_file_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  cloud_file_id uuid NOT NULL REFERENCES public.cloud_files (id) ON DELETE CASCADE,
  link_entity_type public.cloud_file_link_entity_type NOT NULL,
  entity_id uuid NOT NULL,
  link_purpose public.cloud_file_link_purpose NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_cloud_file_links_file_entity_purpose
    UNIQUE (cloud_file_id, link_entity_type, entity_id, link_purpose)
);

COMMENT ON TABLE public.cloud_file_links IS
  'Many-to-many usage links from one stored file to lessons, tasks, messages, etc.';
COMMENT ON COLUMN public.cloud_file_links.entity_id IS 'Primary key of the table named by link_entity_type.';

-- =============================================================================
-- cloud_file_shares — direct user-to-user grants
-- =============================================================================
CREATE TABLE public.cloud_file_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions (id) ON DELETE CASCADE,
  cloud_file_id uuid NOT NULL REFERENCES public.cloud_files (id) ON DELETE CASCADE,
  shared_with_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  shared_by_user_id uuid NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  permission public.cloud_file_share_permission NOT NULL DEFAULT 'read',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_cloud_file_shares_file_recipient UNIQUE (cloud_file_id, shared_with_user_id)
);

COMMENT ON TABLE public.cloud_file_shares IS
  'Optional ACL: grant another user read or edit on a file without changing scope.';
