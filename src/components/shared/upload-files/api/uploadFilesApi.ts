import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/lib/constants'
import type {
  UploadedFile,
  FileUploadResult,
  FileUploadOptions,
  FileListItem,
  FetchFilesResult,
  FetchFilesOptions,
} from '../types/upload.types'
import { MAX_PDF_SIZE_BYTES } from '../types/upload.types'

/**
 * Supabase storage keys reject non-ASCII (umlauts, accents, CJK, …). Bring the name into the
 * safe set [A-Za-z0-9!-_.*'() ] by transliterating German umlauts, stripping diacritics, then
 * substituting anything still outside the safe set with '-'.
 */
function sanitizeStorageBaseName(name: string): string {
  const transliterated = name
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')

  const stripped = transliterated.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

  return stripped
    .replace(/[\\/]/g, '-')
    .replace(/[^A-Za-z0-9!\-_.*'() ]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-\s]+|[-\s]+$/g, '')
    .trim()
}

function sanitizeExtension(ext: string): string {
  return ext.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
}

/** Only teachers → teacher for storage path; all other roles stay as passed. */
function pathRole(role: string): string {
  const r = role.trim()
  if (r.toLowerCase() === 'teachers') return 'teacher'
  return r
}

type StorageClientError = {
  message?: string
  statusCode?: number | string
  error?: string
}

/** Supabase storage duplicate: HTTP 409 and/or message "The resource already exists". */
function isStorageDuplicateError(error: StorageClientError | null | undefined): boolean {
  if (!error) return false

  const statusCode = error.statusCode
  if (statusCode === 409 || statusCode === '409') return true

  if (typeof error.error === 'string' && error.error.toLowerCase() === 'duplicate') {
    return true
  }

  const message = error.message
  if (!message) return false

  const normalized = message.toLowerCase()
  return (
    normalized.includes('already exists') ||
    normalized.includes('resource already exists') ||
    normalized.includes('"error":"duplicate"') ||
    normalized.includes('duplicate')
  )
}

function duplicateBatchResult(fileName: string): FileUploadResult {
  return {
    success: false,
    error: 'Skipped: another file in this upload already uses this name.',
    fileName,
    code: 'duplicate',
  }
}

function publicUrlForStoragePath(storagePath: string): string | undefined {
  const { data } = supabase.storage.from(STORAGE_BUCKETS.cloud).getPublicUrl(storagePath)
  return data?.publicUrl
}

/** Builds the object key under the cloud bucket (no leading slash). */
export function buildCloudFileStoragePath({
  institutionId,
  teacherId,
  file,
  title,
  role,
}: Pick<FileUploadOptions, 'institutionId' | 'teacherId' | 'file' | 'title' | 'role'>): string {
  const baseFileName = title || file.name.split('.')[0]
  const rawExtension = file.name.includes('.') ? (file.name.split('.').pop() ?? '') : ''
  const safeBaseName = sanitizeStorageBaseName(baseFileName)
  const fallbackBase = sanitizeStorageBaseName(file.name.split('.')[0] ?? '') || 'file'
  const safeFileNameWithoutExtension = safeBaseName || fallbackBase
  const safeExtension = sanitizeExtension(rawExtension)
  const sanitizedFileName = safeExtension
    ? `${safeFileNameWithoutExtension}.${safeExtension}`
    : safeFileNameWithoutExtension

  return `${institutionId}/${pathRole(role)}/${teacherId}/${sanitizedFileName}`
}

/**
 * Uploads a single file to Supabase storage
 * Path structure: {institution_id}/{role}/{user_id}/filename.filetype
 *
 * @param options - Upload options including institutionId, teacherId, file, role, and optional metadata
 * @returns Promise with upload result containing path, publicUrl, or error
 */
export async function uploadFile({
  institutionId,
  teacherId,
  file,
  title,
  role,
  batchPathsClaimed,
}: FileUploadOptions): Promise<FileUploadResult> {
  try {
    if (!institutionId || !institutionId.trim()) {
      return {
        success: false,
        error: 'Institution ID is required',
        code: 'validation',
      }
    }

    if (!teacherId || !teacherId.trim()) {
      return {
        success: false,
        error: 'Teacher ID is required',
        code: 'validation',
      }
    }

    if (!file) {
      return {
        success: false,
        error: 'File is required',
        code: 'validation',
      }
    }

    if (!role || !role.trim()) {
      return {
        success: false,
        error: 'Role is required',
        code: 'validation',
      }
    }

    if (file.type === 'application/pdf' && file.size > MAX_PDF_SIZE_BYTES) {
      const actualMb = (file.size / 1024 / 1024).toFixed(1)
      const maxMb = MAX_PDF_SIZE_BYTES / 1024 / 1024
      return {
        success: false,
        error: `PDF is ${actualMb} MB — exceeds the ${maxMb} MB limit.`,
        fileName: file.name,
        code: 'validation',
      }
    }

    const storagePath = buildCloudFileStoragePath({
      institutionId,
      teacherId,
      file,
      title,
      role,
    })

    if (batchPathsClaimed?.has(storagePath)) {
      return duplicateBatchResult(file.name)
    }

    let uploadPath = storagePath
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.cloud)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      if (isStorageDuplicateError(error)) {
        if (batchPathsClaimed?.has(storagePath)) {
          return duplicateBatchResult(file.name)
        }

        // Re-picking the same filename (e.g. lesson image after reload) must succeed, not 409.
        const { data: upsertData, error: upsertError } = await supabase.storage
          .from(STORAGE_BUCKETS.cloud)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (upsertError) {
          return {
            success: false,
            error: upsertError.message || 'The resource already exists',
            fileName: file.name,
            code: isStorageDuplicateError(upsertError) ? 'duplicate' : 'storage',
          }
        }
        uploadPath = upsertData?.path ?? storagePath
      } else {
        console.error('Supabase upload error:', error)
        return {
          success: false,
          error: error.message || 'Failed to upload file',
          fileName: file.name,
          code: 'storage',
        }
      }
    } else {
      const uploadedPath = data?.path
      if (!uploadedPath) {
        return {
          success: false,
          error: 'Upload succeeded but no path returned',
          fileName: file.name,
          code: 'storage',
        }
      }
      uploadPath = uploadedPath
    }

    batchPathsClaimed?.add(uploadPath)

    const publicUrl = publicUrlForStoragePath(uploadPath)

    return {
      success: true,
      path: uploadPath,
      publicUrl,
      fileName: file.name,
    }
  } catch (error) {
    console.error('Unexpected error during file upload:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      fileName: file?.name,
      code: 'unknown',
    }
  }
}

/**
 * Uploads multiple files to Supabase storage
 *
 * @param options - Array of upload options for each file
 * @returns Promise with array of upload results
 */
export async function uploadFiles(options: FileUploadOptions[]): Promise<FileUploadResult[]> {
  try {
    if (!options || options.length === 0) {
      return [
        {
          success: false,
          error: 'No files provided for upload',
          code: 'validation',
        },
      ]
    }

    const batchPathsClaimed = new Set<string>()
    const results: FileUploadResult[] = []

    for (let i = 0; i < options.length; i++) {
      const option = options[i]

      if (option.onProgress) {
        option.onProgress((i / options.length) * 100)
      }

      const result = await uploadFile({
        ...option,
        batchPathsClaimed,
      })
      results.push(result)

      if (!result.success) {
        console.warn(
          `Batch upload skipped/failed file ${i + 1}/${options.length}:`,
          result.error,
          result.code,
        )
      }
    }

    const lastOption = options[options.length - 1]
    if (lastOption?.onProgress) {
      lastOption.onProgress(100)
    }

    return results
  } catch (error) {
    console.error('Unexpected error during batch file upload:', error)
    return options.map((option) => ({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      fileName: option.file?.name,
      code: 'unknown' as const,
    }))
  }
}

/**
 * Uploads files from UploadedFile objects
 *
 * @param files - Array of UploadedFile objects with metadata
 * @param institutionId - Institution ID for the upload path
 * @param teacherId - User ID for the upload path
 * @param role - Role for storage path (e.g., 'teachers', 'students', 'institutionAdmins', 'superAdmins')
 * @param onProgress - Optional progress callback
 * @returns Promise with array of upload results
 */
export async function uploadFilesWithMetadata(
  files: UploadedFile[],
  institutionId: string,
  teacherId: string,
  role: string,
  onProgress?: (progress: number) => void,
): Promise<FileUploadResult[]> {
  try {
    if (!files || files.length === 0) {
      return [
        {
          success: false,
          error: 'No files provided for upload',
          code: 'validation',
        },
      ]
    }

    if (!institutionId || !institutionId.trim()) {
      return files.map(() => ({
        success: false,
        error: 'Institution ID is required',
        code: 'validation' as const,
      }))
    }

    if (!teacherId || !teacherId.trim()) {
      return files.map(() => ({
        success: false,
        error: 'Teacher ID is required',
        code: 'validation' as const,
      }))
    }

    const uploadOptions: FileUploadOptions[] = files.map((uploadedFile, index) => ({
      institutionId,
      teacherId,
      file: uploadedFile.file,
      title: uploadedFile.title,
      role,
      onProgress: onProgress
        ? (progress: number) => {
            const fileProgress = (index / files.length) * 100 + progress / files.length
            onProgress(Math.min(fileProgress, 100))
          }
        : undefined,
    }))

    return await uploadFiles(uploadOptions)
  } catch (error) {
    console.error('Unexpected error during metadata file upload:', error)
    return files.map((file) => ({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      fileName: file.file.name,
      code: 'unknown' as const,
    }))
  }
}

/**
 * Deletes a file from Supabase storage
 *
 * @param path - Storage path of the file to delete (e.g., "teachers/{teacher_id}/filename.ext")
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

    const { error } = await supabase.storage.from(STORAGE_BUCKETS.cloud).remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete file',
      }
    }

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
 * Gets a public URL for a file in storage
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

/**
 * Fetches all files from the storage bucket based on institution, role and user ID
 * Path structure: {institution_id}/{role}/{user_id}/
 *
 * @param institutionId - Institution ID
 * @param role - User role (e.g., 'teacher', 'student', 'institutionAdmin', 'superAdmin')
 * @param userId - User ID
 * @param options - Optional fetch options (limit, sortBy)
 * @returns Promise with fetch result containing files array or error
 */
export async function fetchFilesByRole(
  institutionId: string,
  role: string,
  userId: string,
  options?: FetchFilesOptions,
): Promise<FetchFilesResult> {
  try {
    if (!institutionId || !institutionId.trim()) {
      return {
        success: false,
        error: 'Institution ID is required',
      }
    }

    if (!role || !role.trim()) {
      return {
        success: false,
        error: 'Role is required',
      }
    }

    if (!userId || !userId.trim()) {
      return {
        success: false,
        error: 'User ID is required',
      }
    }

    const storagePath = `${institutionId}/${pathRole(role)}/${userId}/`

    const { data, error } = await supabase.storage.from(STORAGE_BUCKETS.cloud).list(storagePath, {
      limit: options?.limit || 100,
      sortBy: options?.sortBy || { column: 'name', order: 'asc' },
    })

    if (error) {
      console.error('Supabase fetch error:', error)
      return {
        success: false,
        error: error.message || 'Failed to fetch files',
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'No data returned from storage',
      }
    }

    return {
      success: true,
      files: data as FileListItem[],
    }
  } catch (error) {
    console.error('Unexpected error during file fetch:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
