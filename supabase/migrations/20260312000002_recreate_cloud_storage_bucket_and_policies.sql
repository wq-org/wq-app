-- No-op migration kept for ordered history compatibility.
-- Canonical storage bucket/policy migration is:
-- 20260312000001_storage_bucket_files_to_cloud.sql
-- Destructive bucket object cleanup must be run via Storage API script.

BEGIN;

DO $$
BEGIN
  RAISE NOTICE 'No-op: storage bucket/policy setup already handled by 20260312000001_storage_bucket_files_to_cloud.sql';
END
$$;

COMMIT;
