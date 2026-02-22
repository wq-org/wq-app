-- =============================================================================
-- UPDATE STORAGE RLS — New path structure: {institution_id}/{role}/{user_id}/filename
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow authenticated uploads to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Teachers read own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers update own files" ON storage.objects;
DROP POLICY IF EXISTS "Teachers delete own files" ON storage.objects;

-- New RLS Policies

-- 1. Authenticated users can upload to their own institution folder
CREATE POLICY "Users upload to own institution folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'files'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT institution_id FROM public.user_institutions WHERE user_id = auth.uid()
  )
  AND (storage.foldername(name))[2] IN ('teacher', 'student', 'institution_admin', 'super_admin')
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- 2. Users can read files from their institution
CREATE POLICY "Users read files from own institution" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'files'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT institution_id FROM public.user_institutions WHERE user_id = auth.uid()
  )
);

-- 3. Users can read/write only their own files
CREATE POLICY "Users manage own files" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'files'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT institution_id FROM public.user_institutions WHERE user_id = auth.uid()
  )
  AND (storage.foldername(name))[3] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'files'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT institution_id FROM public.user_institutions WHERE user_id = auth.uid()
  )
  AND (storage.foldername(name))[3] = auth.uid()::text
);

-- 4. Authenticated avatars bucket read (keep existing)
DROP POLICY IF EXISTS "authenticated_read_avatars_bucket" ON storage.objects;
CREATE POLICY "authenticated_read_avatars_bucket" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'avatars');
