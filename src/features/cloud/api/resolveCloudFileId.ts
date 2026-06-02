import { supabase } from '@/lib/supabase'

export type ResolveCloudFileIdParams = {
  storageObjectName: string
  institutionId: string
  userId: string
  mimeType: string
  sizeBytes: number
  originalName: string
}

/**
 * Returns the `cloud_files.id` for a storage object after upload.
 * Uses `register_uploaded_cloud_file` RPC (SECURITY DEFINER) so registration
 * succeeds when the actor has membership or a legacy `user_institutions` row.
 */
export async function resolveCloudFileId(params: ResolveCloudFileIdParams): Promise<string | null> {
  const { storageObjectName, institutionId, mimeType, sizeBytes, originalName } = params
  const path = storageObjectName.trim()

  if (!path) {
    return null
  }

  const existingId = await lookupCloudFileIdByStoragePath(path)
  if (existingId) {
    return existingId
  }

  const { data, error } = await supabase.rpc('register_uploaded_cloud_file', {
    p_institution_id: institutionId,
    p_storage_object_name: path,
    p_mime_type: mimeType,
    p_size_bytes: sizeBytes,
    p_original_name: originalName,
  })

  if (error) {
    console.error('[resolveCloudFileId] register_uploaded_cloud_file failed', error)
    return null
  }

  const id = typeof data === 'string' ? data : null
  return id?.trim() ? id : null
}

export async function lookupCloudFileIdByStoragePath(
  storageObjectName: string,
): Promise<string | null> {
  const path = storageObjectName.trim()
  if (!path) return null

  const { data, error } = await supabase
    .from('cloud_files')
    .select('id')
    .eq('storage_object_name', path)
    .maybeSingle()

  if (error) {
    console.error('[lookupCloudFileIdByStoragePath] lookup failed', error)
    return null
  }

  return (data?.id as string | undefined) ?? null
}

export async function lookupStoragePathByCloudFileId(cloudFileId: string): Promise<string | null> {
  const id = cloudFileId.trim()
  if (!id) return null

  const { data, error } = await supabase
    .from('cloud_files')
    .select('storage_object_name')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[lookupStoragePathByCloudFileId] lookup failed', error)
    return null
  }

  const path = data?.storage_object_name
  return typeof path === 'string' && path.trim() ? path.trim() : null
}
