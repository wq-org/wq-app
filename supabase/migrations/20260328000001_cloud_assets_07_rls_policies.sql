-- =============================================================================
-- CLOUD ASSETS — RLS policies
-- Requires: 20260328000001_cloud_assets_06_triggers
-- =============================================================================

-- =============================================================================
-- cloud_folders
-- =============================================================================
ALTER TABLE public.cloud_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_folders FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cloud_folders_all_super_admin ON public.cloud_folders;
CREATE POLICY cloud_folders_all_super_admin ON public.cloud_folders
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS cloud_folders_all_institution_admin ON public.cloud_folders;
CREATE POLICY cloud_folders_all_institution_admin ON public.cloud_folders
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS cloud_folders_select_scope ON public.cloud_folders;
CREATE POLICY cloud_folders_select_scope ON public.cloud_folders
  FOR SELECT TO authenticated
  USING ((SELECT app.user_can_select_cloud_folder(id)) IS TRUE);

DROP POLICY IF EXISTS cloud_folders_insert_member ON public.cloud_folders;
CREATE POLICY cloud_folders_insert_member ON public.cloud_folders
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = (SELECT auth.uid())
    AND institution_id IN (SELECT app.member_institution_ids())
  );

DROP POLICY IF EXISTS cloud_folders_update_manager ON public.cloud_folders;
CREATE POLICY cloud_folders_update_manager ON public.cloud_folders
  FOR UPDATE TO authenticated
  USING ((SELECT app.user_can_manage_cloud_folder(id)) IS TRUE)
  WITH CHECK ((SELECT app.user_can_manage_cloud_folder(id)) IS TRUE);

DROP POLICY IF EXISTS cloud_folders_delete_manager ON public.cloud_folders;
CREATE POLICY cloud_folders_delete_manager ON public.cloud_folders
  FOR DELETE TO authenticated
  USING ((SELECT app.user_can_manage_cloud_folder(id)) IS TRUE);

-- =============================================================================
-- cloud_files
-- =============================================================================
ALTER TABLE public.cloud_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_files FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cloud_files_all_super_admin ON public.cloud_files;
CREATE POLICY cloud_files_all_super_admin ON public.cloud_files
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS cloud_files_all_institution_admin ON public.cloud_files;
CREATE POLICY cloud_files_all_institution_admin ON public.cloud_files
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS cloud_files_select_scope ON public.cloud_files;
CREATE POLICY cloud_files_select_scope ON public.cloud_files
  FOR SELECT TO authenticated
  USING ((SELECT app.user_can_select_cloud_file(id)) IS TRUE);

DROP POLICY IF EXISTS cloud_files_insert_owner ON public.cloud_files;
CREATE POLICY cloud_files_insert_owner ON public.cloud_files
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = (SELECT auth.uid())
    AND institution_id IN (SELECT app.member_institution_ids())
  );

DROP POLICY IF EXISTS cloud_files_update_manager ON public.cloud_files;
CREATE POLICY cloud_files_update_manager ON public.cloud_files
  FOR UPDATE TO authenticated
  USING ((SELECT app.user_can_manage_cloud_file(id)) IS TRUE)
  WITH CHECK ((SELECT app.user_can_manage_cloud_file(id)) IS TRUE);

DROP POLICY IF EXISTS cloud_files_delete_manager ON public.cloud_files;
CREATE POLICY cloud_files_delete_manager ON public.cloud_files
  FOR DELETE TO authenticated
  USING ((SELECT app.user_can_manage_cloud_file(id)) IS TRUE);

-- =============================================================================
-- cloud_file_links
-- =============================================================================
ALTER TABLE public.cloud_file_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_file_links FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cloud_file_links_all_super_admin ON public.cloud_file_links;
CREATE POLICY cloud_file_links_all_super_admin ON public.cloud_file_links
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS cloud_file_links_all_institution_admin ON public.cloud_file_links;
CREATE POLICY cloud_file_links_all_institution_admin ON public.cloud_file_links
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS cloud_file_links_select_file_reader ON public.cloud_file_links;
CREATE POLICY cloud_file_links_select_file_reader ON public.cloud_file_links
  FOR SELECT TO authenticated
  USING ((SELECT app.user_can_select_cloud_file(cloud_file_id)) IS TRUE);

DROP POLICY IF EXISTS cloud_file_links_insert_manager ON public.cloud_file_links;
CREATE POLICY cloud_file_links_insert_manager ON public.cloud_file_links
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE
    AND institution_id IN (SELECT app.member_institution_ids())
  );

DROP POLICY IF EXISTS cloud_file_links_update_manager ON public.cloud_file_links;
CREATE POLICY cloud_file_links_update_manager ON public.cloud_file_links
  FOR UPDATE TO authenticated
  USING ((SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE)
  WITH CHECK ((SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE);

DROP POLICY IF EXISTS cloud_file_links_delete_manager ON public.cloud_file_links;
CREATE POLICY cloud_file_links_delete_manager ON public.cloud_file_links
  FOR DELETE TO authenticated
  USING ((SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE);

-- =============================================================================
-- cloud_file_shares
-- =============================================================================
ALTER TABLE public.cloud_file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloud_file_shares FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cloud_file_shares_all_super_admin ON public.cloud_file_shares;
CREATE POLICY cloud_file_shares_all_super_admin ON public.cloud_file_shares
  FOR ALL TO authenticated
  USING ((SELECT app.is_super_admin()) IS TRUE)
  WITH CHECK ((SELECT app.is_super_admin()) IS TRUE);

DROP POLICY IF EXISTS cloud_file_shares_all_institution_admin ON public.cloud_file_shares;
CREATE POLICY cloud_file_shares_all_institution_admin ON public.cloud_file_shares
  FOR ALL TO authenticated
  USING (institution_id IN (SELECT app.admin_institution_ids()))
  WITH CHECK (institution_id IN (SELECT app.admin_institution_ids()));

DROP POLICY IF EXISTS cloud_file_shares_select_recipient_or_manager ON public.cloud_file_shares;
CREATE POLICY cloud_file_shares_select_recipient_or_manager ON public.cloud_file_shares
  FOR SELECT TO authenticated
  USING (
    shared_with_user_id = (SELECT auth.uid())
    OR shared_by_user_id = (SELECT auth.uid())
    OR (SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE
  );

DROP POLICY IF EXISTS cloud_file_shares_insert_manager ON public.cloud_file_shares;
CREATE POLICY cloud_file_shares_insert_manager ON public.cloud_file_shares
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE
    AND shared_by_user_id = (SELECT auth.uid())
    AND institution_id IN (SELECT app.member_institution_ids())
  );

DROP POLICY IF EXISTS cloud_file_shares_update_manager ON public.cloud_file_shares;
CREATE POLICY cloud_file_shares_update_manager ON public.cloud_file_shares
  FOR UPDATE TO authenticated
  USING (
    shared_by_user_id = (SELECT auth.uid())
    OR (SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE
  )
  WITH CHECK (
    shared_by_user_id = (SELECT auth.uid())
    OR (SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE
  );

DROP POLICY IF EXISTS cloud_file_shares_delete_manager ON public.cloud_file_shares;
CREATE POLICY cloud_file_shares_delete_manager ON public.cloud_file_shares
  FOR DELETE TO authenticated
  USING (
    shared_by_user_id = (SELECT auth.uid())
    OR (SELECT app.user_can_manage_cloud_file(cloud_file_id)) IS TRUE
  );
