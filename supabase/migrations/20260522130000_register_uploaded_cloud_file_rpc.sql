-- =============================================================================
-- Register cloud_files row after client upload to Storage (teacher path layout)
-- =============================================================================
-- Problem
--   uploadFile writes to {institution_id}/{role}/{user_id}/{filename} but
--   resolveCloudFileId used a direct client INSERT into cloud_files, which
--   fails RLS (42501) when institution_memberships is missing for the actor.
--
-- Solution
--   SECURITY DEFINER RPC that:
--     - Re-validates membership (memberships + legacy user_institutions)
--     - Validates storage path belongs to caller + institution
--     - Inserts or returns existing cloud_files.id by storage_object_name
--
-- Requires
--   - public.cloud_files (20260329000017)
--   - app.member_institution_ids() (20260419100000)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.register_uploaded_cloud_file(
  p_institution_id uuid,
  p_storage_object_name text,
  p_mime_type text,
  p_size_bytes bigint,
  p_original_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid;
  v_existing_id uuid;
  v_path text;
BEGIN
  v_actor_id := (SELECT auth.uid());

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;

  v_path := btrim(p_storage_object_name);

  IF v_path = '' THEN
    RAISE EXCEPTION 'storage_object_name is required';
  END IF;

  IF p_size_bytes < 0 THEN
    RAISE EXCEPTION 'size_bytes must be non-negative';
  END IF;

  -- Institution access: active membership or legacy user_institutions row.
  IF NOT (
    (SELECT app.is_super_admin())
    OR p_institution_id IN (SELECT app.member_institution_ids())
    OR EXISTS (
      SELECT 1
      FROM public.user_institutions ui
      WHERE ui.user_id = v_actor_id
        AND ui.institution_id = p_institution_id
    )
  ) THEN
    RAISE EXCEPTION 'not an institution member';
  END IF;

  -- Path must be under this institution and include the caller user id segment.
  IF v_path NOT LIKE p_institution_id::text || '/%' THEN
    RAISE EXCEPTION 'storage path does not match institution';
  END IF;

  IF v_path NOT LIKE '%/' || v_actor_id::text || '/%' THEN
    RAISE EXCEPTION 'storage path does not belong to caller';
  END IF;

  SELECT cf.id
  INTO v_existing_id
  FROM public.cloud_files cf
  WHERE cf.bucket = 'cloud'
    AND cf.storage_object_name = v_path
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN v_existing_id;
  END IF;

  INSERT INTO public.cloud_files (
    institution_id,
    owner_user_id,
    bucket,
    storage_object_name,
    scope,
    mime_type,
    size_bytes,
    original_name,
    status,
    created_by,
    updated_by
  )
  VALUES (
    p_institution_id,
    v_actor_id,
    'cloud',
    v_path,
    'personal'::public.cloud_file_scope,
    p_mime_type,
    p_size_bytes,
    p_original_name,
    'active'::public.cloud_file_status,
    v_actor_id,
    v_actor_id
  )
  RETURNING id INTO v_existing_id;

  RETURN v_existing_id;
END;
$$;

COMMENT ON FUNCTION public.register_uploaded_cloud_file(
  uuid,
  text,
  text,
  bigint,
  text
) IS
  'Registers (or returns) cloud_files metadata for an object already uploaded to '
  'the cloud bucket under {institution_id}/{role}/{user_id}/…. Caller must own '
  'the path segment and belong to the institution.';

REVOKE ALL ON FUNCTION public.register_uploaded_cloud_file(
  uuid,
  text,
  text,
  bigint,
  text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_uploaded_cloud_file(
  uuid,
  text,
  text,
  bigint,
  text
) TO authenticated;
