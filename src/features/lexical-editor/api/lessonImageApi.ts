import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { ALLOWED_IMAGE_TYPES } from '@/components/shared/upload-files/types/upload.types'
import { getFileSignedUrl } from '@/features/files'
import { resolveCloudFileId } from '@/features/files/api/resolveCloudFileId'

export type LessonImageUploadContext = {
  institutionId: string
  userId: string
  role: string
}

export type LessonImageUploadResult = {
  /** Browser-displayable URL (signed when the cloud bucket is private). */
  publicUrl: string
  filepath: string
  cloudFileId: string
}

export type LessonImageUploadErrorCode =
  | 'missing_context'
  | 'invalid_type'
  | 'upload_failed'
  | 'already_exists'

function isDuplicateUploadError(message: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('already exists') ||
    normalized.includes('duplicate') ||
    normalized.includes('resource already')
  )
}

export type LessonImageUploadResponse =
  | { ok: true; data: LessonImageUploadResult }
  | { ok: false; error: string; code: LessonImageUploadErrorCode }

export async function uploadLessonImage(
  file: File,
  context: LessonImageUploadContext,
): Promise<LessonImageUploadResponse> {
  const institutionId = context.institutionId.trim()
  const userId = context.userId.trim()
  const role = context.role.trim()

  if (!institutionId || !userId || !role) {
    return {
      ok: false,
      code: 'missing_context',
      error: 'Sign in with an institution to upload images.',
    }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      ok: false,
      code: 'invalid_type',
      error: 'Please choose a JPEG or PNG image.',
    }
  }

  const result = await uploadFile({
    institutionId,
    teacherId: userId,
    file,
    title: file.name.split('.')[0] || 'lesson-image',
    role,
  })

  if (!result.success || !result.path) {
    const errorMessage = result.error ?? 'Could not upload image.'
    return {
      ok: false,
      code: isDuplicateUploadError(errorMessage) ? 'already_exists' : 'upload_failed',
      error: errorMessage,
    }
  }

  const cloudFileId = await resolveCloudFileId({
    storageObjectName: result.path,
    institutionId,
    userId,
    mimeType: file.type,
    sizeBytes: file.size,
    originalName: file.name,
  })

  if (!cloudFileId) {
    return {
      ok: false,
      code: 'upload_failed',
      error: 'Could not register uploaded image.',
    }
  }

  const signedUrl = await getFileSignedUrl(result.path, 3600)
  const displayUrl = signedUrl ?? result.publicUrl ?? null
  if (!displayUrl) {
    return {
      ok: false,
      code: 'upload_failed',
      error: 'Could not resolve image URL after upload.',
    }
  }

  return {
    ok: true,
    data: {
      publicUrl: displayUrl,
      filepath: result.path,
      cloudFileId,
    },
  }
}
