import { supabase } from '@/lib/supabase'
import type {
  UploadedFile,
  FileUploadResult,
  FileUploadOptions,
  FileListItem,
  FetchFilesResult,
  FetchFilesOptions,
} from '../types/upload.types'

const BUCKET_NAME = 'files'

/** Only teachers → teacher for storage path; all other roles stay as passed. */
function pathRole(role: string): string {
  const r = role.trim()
  if (r.toLowerCase() === 'teachers') return 'teacher'
  return r
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
}: FileUploadOptions): Promise<FileUploadResult> {
  console.log('current role :>>', role)
  console.log('typeof role :>> ', typeof role);
  console.log('institutionId :>> ', institutionId);

  try {
    // Validate inputs
    if (!institutionId || !institutionId.trim()) {
      return {
        success: false,
        error: 'Institution ID is required',
      }
    }

    if (!teacherId || !teacherId.trim()) {
      return {
        success: false,
        error: 'Teacher ID is required',
      }
    }

    if (!file) {
      return {
        success: false,
        error: 'File is required',
      }
    }

    if (!role || !role.trim()) {
      return {
        success: false,
        error: 'Role is required',
      }
    }

    // Use title if provided, otherwise use original filename
    const baseFileName = title || file.name.split('.')[0]
    const fileExtension = file.name.split('.').pop() || ''

    // Sanitize filename
    const sanitizedBaseName = baseFileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_')
    const sanitizedFileName = `${sanitizedBaseName}.${fileExtension}`

    // Construct storage path: {institution_id}/{role}/{user_id}/filename.filetype
    const storagePath = `${institutionId}/${pathRole(role)}/${teacherId}/${sanitizedFileName}`

    console.log('Uploading file:', {
      originalFileName: file.name,
      title,
      sanitizedFileName,
      storagePath,
      fileSize: file.size,
      fileType: file.type,
      institutionId,
      teacherId,
    })

    // Upload file to Supabase storage
    // Note: Supabase automatically creates folders if they don't exist
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false, // Set to true if you want to overwrite existing files
    })

    if (error) {
      console.error('Supabase upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload file',
        fileName: file.name,
      }
    }

    if (!data?.path) {
      return {
        success: false,
        error: 'Upload succeeded but no path returned',
        fileName: file.name,
      }
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    const publicUrl = urlData?.publicUrl

    return {
      success: true,
      path: data.path,
      publicUrl,
      fileName: file.name,
    }
  } catch (error) {
    console.error('Unexpected error during file upload:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      fileName: file?.name,
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
        },
      ]
    }

    console.log(`Starting upload of ${options.length} file(s)...`)

    // Upload files sequentially to avoid overwhelming the storage
    const results: FileUploadResult[] = []

    for (let i = 0; i < options.length; i++) {
      const option = options[i]
      console.log('options :>> ', options);

      // Update progress if callback provided
      if (option.onProgress) {
        option.onProgress((i / options.length) * 100)
      }

      const result = await uploadFile(option)
      results.push(result)

      // Log each result
      if (result.success) {
        console.log(`File ${i + 1}/${options.length} uploaded:`, result.path)
      } else {
        console.error(`File ${i + 1}/${options.length} failed:`, result.error)
      }
    }

    // Final progress update
    const lastOption = options[options.length - 1]
    if (lastOption?.onProgress) {
      lastOption.onProgress(100)
    }

    const successCount = results.filter((r) => r.success).length
    console.log(`Upload complete: ${successCount}/${options.length} files uploaded successfully`)

    return results
  } catch (error) {
    console.error('Unexpected error during batch file upload:', error)
    return options.map((option) => ({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      fileName: option.file?.name,
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
        },
      ]
    }

    if (!institutionId || !institutionId.trim()) {
      return files.map(() => ({
        success: false,
        error: 'Institution ID is required',
      }))
    }

    if (!teacherId || !teacherId.trim()) {
      return files.map(() => ({
        success: false,
        error: 'Teacher ID is required',
      }))
    }

    console.log('Uploading files with metadata:', {
      fileCount: files.length,
      institutionId,
      teacherId,
      files: files.map((f) => ({
        fileName: f.file.name,
        title: f.title,
      })),
    })

    const uploadOptions: FileUploadOptions[] = files.map((uploadedFile, index) => ({
      institutionId,
      teacherId,
      file: uploadedFile.file,
      title: uploadedFile.title,
      role,
      onProgress: onProgress
        ? (progress: number) => { 
            // Calculate overall progress across all files
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

    console.log('Deleting file:', path)

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

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

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
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

    // Extract directory from old path (e.g., "teachers/{user_id}/" from "teachers/{user_id}/oldname.ext")
    const pathParts = oldPath.split('/')
    const directory = pathParts.slice(0, -1).join('/')
    const newPath = `${directory}/${newFilename}`

    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(oldPath)

    if (downloadError || !fileData) {
      console.error('Supabase download error:', downloadError)
      return {
        success: false,
        error: downloadError?.message || 'Failed to download file for rename',
      }
    }

    // Upload with new name
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
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

    // Delete old file
    const { error: deleteError } = await supabase.storage.from(BUCKET_NAME).remove([oldPath])

    if (deleteError) {
      console.error('Supabase delete error during rename:', deleteError)
      // Note: New file was created but old one wasn't deleted
      // This is not ideal but we'll return success since the rename "worked"
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
    // Validate inputs
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

    // Construct storage path: {institution_id}/{role}/{user_id}/ (role singular for storage)
    const storagePath = `${institutionId}/${pathRole(role)}/${userId}/`


    // Fetch files from Supabase storage
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(storagePath, {
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

    console.log('Files fetched successfully:', {
      count: data.length,
      files: data.map((file) => ({
        name: file.name,
        id: file.id,
        created_at: file.created_at,
        updated_at: file.updated_at,
      })),
    })

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
