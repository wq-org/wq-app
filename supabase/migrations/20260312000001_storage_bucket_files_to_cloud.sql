-- Rename storage usage from legacy 'files' bucket to 'cloud' by
-- recreating storage RLS policies.
-- NOTE: Supabase blocks direct DELETE from storage.objects in SQL migrations.
-- Object cleanup must be done via Storage API (service role), not SQL.

BEGIN;

CREATE OR REPLACE FUNCTION public._migrate_storage_bucket_files_to_cloud()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Drop both legacy and current policy names so we can recreate cleanly.
  DROP POLICY IF EXISTS "Allow authenticated uploads to files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated read files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated read own files" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers upload to own folder" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers read own files" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers update own files" ON storage.objects;
  DROP POLICY IF EXISTS "Teachers delete own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users upload to own institution folder" ON storage.objects;
  DROP POLICY IF EXISTS "Users read files from own institution" ON storage.objects;
  DROP POLICY IF EXISTS "Users manage own files" ON storage.objects;

  -- Ensure cloud bucket exists (non-destructive, SQL-safe).
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('cloud', 'cloud', false)
  ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

  -- Keep other buckets present.
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', false), ('backgrounds', 'backgrounds', false)
  ON CONFLICT (id) DO NOTHING;

  -- Recreate storage policies for cloud bucket.
  CREATE POLICY "Users upload to own institution folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_institutions ui
      WHERE ui.user_id = auth.uid()
        AND ui.institution_id::text = (storage.foldername(name))[1]
    )
    AND (storage.foldername(name))[2] IN ('teacher', 'student', 'institution_admin', 'super_admin')
    AND (storage.foldername(name))[3] = auth.uid()::text
  );

  CREATE POLICY "Users read files from own institution" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_institutions ui
      WHERE ui.user_id = auth.uid()
        AND ui.institution_id::text = (storage.foldername(name))[1]
    )
  );

  CREATE POLICY "Users manage own files" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_institutions ui
      WHERE ui.user_id = auth.uid()
        AND ui.institution_id::text = (storage.foldername(name))[1]
    )
    AND (storage.foldername(name))[3] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'cloud'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.user_institutions ui
      WHERE ui.user_id = auth.uid()
        AND ui.institution_id::text = (storage.foldername(name))[1]
    )
    AND (storage.foldername(name))[3] = auth.uid()::text
  );

  DROP POLICY IF EXISTS "authenticated_read_avatars_bucket" ON storage.objects;
  CREATE POLICY "authenticated_read_avatars_bucket" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');
END;
$$;

SELECT public._migrate_storage_bucket_files_to_cloud();
DROP FUNCTION IF EXISTS public._migrate_storage_bucket_files_to_cloud();

COMMIT;
