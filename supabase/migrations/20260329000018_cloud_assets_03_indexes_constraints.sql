-- =============================================================================
-- CLOUD ASSETS — indexes & constraints
-- Requires: 20260329000017_cloud_assets_02_tables
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_cloud_folders_institution_id
  ON public.cloud_folders (institution_id);

CREATE INDEX IF NOT EXISTS idx_cloud_folders_owner_user_id
  ON public.cloud_folders (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_cloud_folders_parent_folder_id
  ON public.cloud_folders (parent_folder_id)
  WHERE parent_folder_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cloud_folders_scope
  ON public.cloud_folders (institution_id, scope);

CREATE INDEX IF NOT EXISTS idx_cloud_files_institution_id
  ON public.cloud_files (institution_id);

CREATE INDEX IF NOT EXISTS idx_cloud_files_owner_user_id
  ON public.cloud_files (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_cloud_files_folder_id
  ON public.cloud_files (folder_id)
  WHERE folder_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cloud_files_institution_status
  ON public.cloud_files (institution_id, status);

CREATE INDEX IF NOT EXISTS idx_cloud_files_classroom_id
  ON public.cloud_files (classroom_id)
  WHERE classroom_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cloud_files_course_id
  ON public.cloud_files (course_id)
  WHERE course_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cloud_file_links_institution_id
  ON public.cloud_file_links (institution_id);

CREATE INDEX IF NOT EXISTS idx_cloud_file_links_cloud_file_id
  ON public.cloud_file_links (cloud_file_id);

CREATE INDEX IF NOT EXISTS idx_cloud_file_links_entity
  ON public.cloud_file_links (link_entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_cloud_file_shares_institution_id
  ON public.cloud_file_shares (institution_id);

CREATE INDEX IF NOT EXISTS idx_cloud_file_shares_cloud_file_id
  ON public.cloud_file_shares (cloud_file_id);

CREATE INDEX IF NOT EXISTS idx_cloud_file_shares_shared_with_user_id
  ON public.cloud_file_shares (shared_with_user_id);
