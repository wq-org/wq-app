import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/lib/constants'
import type { UserRole } from '@/features/auth'
import type { CloudFileItem, CloudFileKind } from '../types/files.types'

function inferCloudFileKind(name: string, mimeType?: string | null): CloudFileKind {
  const normalizedName = name.toLowerCase()
  const normalizedMimeType = mimeType?.toLowerCase() ?? ''

  if (
    normalizedMimeType.startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|svg)$/.test(normalizedName)
  ) {
    return 'image'
  }

  if (normalizedMimeType.startsWith('video/') || /\.(mp4|mov|avi|webm|m4v)$/.test(normalizedName)) {
    return 'video'
  }

  if (normalizedMimeType === 'application/pdf' || normalizedName.endsWith('.pdf')) {
    return 'pdf'
  }

  return 'file'
}

function resolveStorageRole(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'superadmin'
    case 'institution_admin':
      return 'institutionAdmin'
    default:
      return role
  }
}

/**
 * Gets a signed URL for a file in storage (for private files)
 *
 * @param path - Storage path of the file
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise with signed URL string or null if path is invalid
 */
export async function getFileSignedUrl(
  path: string,
  expiresIn: number = 3600,
): Promise<string | null> {
  try {
    if (!path || !path.trim()) {
      return null
    }

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.cloud)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data?.signedUrl || null
  } catch (error) {
    console.error('Unexpected error getting signed URL:', error)
    return null
  }
}

/**
 * Gets a public URL for a file in storage (for public files)
 *
 * @param path - Storage path of the file
 * @returns Public URL string or null if path is invalid
 */
export function getFilePublicUrl(path: string): string | null {
  try {
    if (!path || !path.trim()) {
      return null
    }

    const { data } = supabase.storage.from(STORAGE_BUCKETS.cloud).getPublicUrl(path)
    return data?.publicUrl || null
  } catch (error) {
    console.error('Error getting public URL:', error)
    return null
  }
}

/**
 * Downloads a file from storage and creates a blob URL
 * This works for both public and private buckets
 *
 * @param path - Storage path of the file
 * @returns Promise with blob URL string or null if download fails
 */
export async function getFileBlobUrl(path: string): Promise<string | null> {
  try {
    if (!path || !path.trim()) {
      return null
    }

    console.log('Downloading file:', path)

    const { data, error } = await supabase.storage.from(STORAGE_BUCKETS.cloud).download(path)

    if (error) {
      console.error('Error downloading file:', error)
      return null
    }

    if (!data) {
      console.error('No data returned from download')
      return null
    }

    const blobUrl = URL.createObjectURL(data)
    return blobUrl
  } catch (error) {
    console.error('Unexpected error downloading file:', error)
    return null
  }
}

/**
 * Deletes a file from Supabase storage
 *
 * @param path - Storage path of the file to delete (e.g., "teacher/{teacher_id}/filename.ext")
 * @returns Promise with success status and optional error message
 */
export async function deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!path || !path.trim()) {
      return {
        success: false,
        error: 'File path is required',
      }
    }

    console.log('Deleting file:', path)

    const { error } = await supabase.storage.from(STORAGE_BUCKETS.cloud).remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete file',
      }
    }

    console.log('File deleted successfully:', path)
    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error during file deletion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Renames a file in Supabase storage by copying to new path and deleting old path
 * Note: Supabase storage doesn't support direct rename, so we copy and delete
 *
 * @param oldPath - Current storage path of the file
 * @param newFilename - New filename (without path, just the filename with extension)
 * @returns Promise with success status and optional error message or new path
 */
export async function renameFile(
  oldPath: string,
  newFilename: string,
): Promise<{ success: boolean; newPath?: string; error?: string }> {
  try {
    if (!oldPath || !oldPath.trim()) {
      return {
        success: false,
        error: 'Old file path is required',
      }
    }

    if (!newFilename || !newFilename.trim()) {
      return {
        success: false,
        error: 'New filename is required',
      }
    }

    const pathParts = oldPath.split('/')
    const directory = pathParts.slice(0, -1).join('/')
    const newPath = `${directory}/${newFilename}`

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKETS.cloud)
      .download(oldPath)

    if (downloadError || !fileData) {
      console.error('Supabase download error:', downloadError)
      return {
        success: false,
        error: downloadError?.message || 'Failed to download file for rename',
      }
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.cloud)
      .upload(newPath, fileData, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError || !uploadData) {
      console.error('Supabase upload error during rename:', uploadError)
      return {
        success: false,
        error: uploadError?.message || 'Failed to upload file with new name',
      }
    }

    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKETS.cloud)
      .remove([oldPath])

    if (deleteError) {
      console.error('Supabase delete error during rename:', deleteError)
      console.warn('Warning: New file created but old file could not be deleted')
    }

    console.log('File renamed successfully:', {
      oldPath,
      newPath: uploadData.path,
    })

    return {
      success: true,
      newPath: uploadData.path,
    }
  } catch (error) {
    console.error('Unexpected error during file rename:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

export async function listCloudFiles(
  institutionId: string,
  role: UserRole,
  userId: string,
): Promise<CloudFileItem[]> {
  if (!institutionId || !userId) {
    return []
  }

  const storagePath = `${institutionId}/${resolveStorageRole(role)}/${userId}`
  const { data, error } = await supabase.storage.from(STORAGE_BUCKETS.cloud).list(storagePath, {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error) {
    console.error('Error listing cloud files:', error)
    throw error
  }

  return (data || [])
    .filter((item) => typeof item.name === 'string' && item.name.trim() !== '')
    .map((item) => {
      const metadata =
        typeof item.metadata === 'object' && item.metadata != null
          ? (item.metadata as Record<string, unknown>)
          : {}
      const mimeType = typeof metadata.mimetype === 'string' ? metadata.mimetype : null
      const size = typeof metadata.size === 'number' ? metadata.size : null

      return {
        name: item.name,
        path: `${storagePath}/${item.name}`,
        mimeType,
        size,
        kind: inferCloudFileKind(item.name, mimeType),
        createdAt: typeof item.created_at === 'string' ? item.created_at : null,
        updatedAt: typeof item.updated_at === 'string' ? item.updated_at : null,
      }
    })
}
