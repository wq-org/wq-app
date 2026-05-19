import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { ALLOWED_IMAGE_TYPES } from '@/components/shared/upload-files/types/upload.types'

export type LessonImageUploadContext = {
  institutionId: string
  userId: string
  role: string
}

export type LessonImageUploadResult = {
  publicUrl: string
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

  if (!result.success || !result.publicUrl) {
    const errorMessage = result.error ?? 'Could not upload image.'
    if (isDuplicateUploadError(errorMessage)) {
      return {
        ok: false,
        code: 'already_exists',
        error: errorMessage,
      }
    }
    return {
      ok: false,
      code: 'upload_failed',
      error: errorMessage,
    }
  }

  return {
    ok: true,
    data: { publicUrl: result.publicUrl },
  }
}
