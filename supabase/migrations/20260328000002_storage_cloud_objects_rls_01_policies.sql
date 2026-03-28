-- =============================================================================
-- STORAGE — cloud bucket RLS aligned with cloud_files metadata
-- Requires: 20260328000001_cloud_assets (all parts)
-- Replaces: narrow segment of policies from 20260323000001_baseline_lms_rls_memberships_07
--
-- Path layout:
--   New canonical objects: {institution_id}/files/{cloud_file_id}
--   Legacy objects:        {institution_id}/{role}/{user_id}/…
-- Legacy SELECT remains institution-wide; new /files/ prefix requires cloud_files + ACL helper.
-- =============================================================================

DROP POLICY IF EXISTS storage_objects_insert_authenticated_institution_folder ON storage.objects;
CREATE POLICY storage_objects_insert_authenticated_institution_folder ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND (storage.foldername(name))[1]::uuid IN (SELECT app.member_institution_ids())
    AND (
      (
        (storage.foldername(name))[2] = 'files'
        AND EXISTS (
          SELECT 1
          FROM public.cloud_files cf
          WHERE cf.bucket = 'cloud'
            AND cf.storage_object_name = name
            AND cf.owner_user_id = (SELECT auth.uid())
        )
      )
      OR (
        (storage.foldername(name))[2] IN ('teacher', 'student', 'institution_admin', 'super_admin')
        AND (storage.foldername(name))[3] = (SELECT auth.uid())::text
      )
    )
  );

DROP POLICY IF EXISTS storage_objects_select_authenticated_institution ON storage.objects;
CREATE POLICY storage_objects_select_authenticated_institution ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND (storage.foldername(name))[1]::uuid IN (SELECT app.member_institution_ids())
    AND (
      (
        (storage.foldername(name))[2] = 'files'
        AND EXISTS (
          SELECT 1
          FROM public.cloud_files cf
          WHERE cf.bucket = 'cloud'
            AND cf.storage_object_name = name
            AND (SELECT app.user_can_select_cloud_file(cf.id)) IS TRUE
        )
      )
      OR (storage.foldername(name))[2] IS DISTINCT FROM 'files'
    )
  );

DROP POLICY IF EXISTS storage_objects_all_authenticated_own_object ON storage.objects;
CREATE POLICY storage_objects_all_authenticated_own_object ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND (storage.foldername(name))[1]::uuid IN (SELECT app.member_institution_ids())
    AND (
      (
        (storage.foldername(name))[2] = 'files'
        AND EXISTS (
          SELECT 1
          FROM public.cloud_files cf
          WHERE cf.bucket = 'cloud'
            AND cf.storage_object_name = name
            AND cf.owner_user_id = (SELECT auth.uid())
            AND (SELECT app.user_can_manage_cloud_file(cf.id)) IS TRUE
        )
      )
      OR (
        (storage.foldername(name))[2] IN ('teacher', 'student', 'institution_admin', 'super_admin')
        AND (storage.foldername(name))[3] = (SELECT auth.uid())::text
      )
    )
  )
  WITH CHECK (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND (storage.foldername(name))[1]::uuid IN (SELECT app.member_institution_ids())
    AND (
      (
        (storage.foldername(name))[2] = 'files'
        AND EXISTS (
          SELECT 1
          FROM public.cloud_files cf
          WHERE cf.bucket = 'cloud'
            AND cf.storage_object_name = name
            AND cf.owner_user_id = (SELECT auth.uid())
            AND (SELECT app.user_can_manage_cloud_file(cf.id)) IS TRUE
        )
      )
      OR (
        (storage.foldername(name))[2] IN ('teacher', 'student', 'institution_admin', 'super_admin')
        AND (storage.foldername(name))[3] = (SELECT auth.uid())::text
      )
    )
  );
