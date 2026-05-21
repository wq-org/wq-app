import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { ALLOWED_IMAGE_TYPES } from '@/components/shared/upload-files/types/upload.types'
import { supabase } from '@/lib/supabase'

export type LessonImageUploadContext = {
  institutionId: string
  userId: string
  role: string
}

export type LessonImageUploadResult = {
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

async function resolveCloudFileId(
  storageObjectName: string,
  institutionId: string,
  userId: string,
  mimeType: string,
  sizeBytes: number,
  originalName: string,
): Promise<string | null> {
  const { data: existing, error: lookupError } = await supabase
    .from('cloud_files')
    .select('id')
    .eq('storage_object_name', storageObjectName)
    .maybeSingle()

  if (lookupError) {
    console.error('[lessonImageApi] cloud_files lookup failed', lookupError)
  }

  if (existing?.id) {
    return existing.id as string
  }

  const { data: inserted, error: insertError } = await supabase
    .from('cloud_files')
    .insert({
      institution_id: institutionId,
      owner_user_id: userId,
      bucket: 'cloud',
      storage_object_name: storageObjectName,
      scope: 'personal',
      mime_type: mimeType,
      size_bytes: sizeBytes,
      original_name: originalName,
      status: 'active',
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('[lessonImageApi] cloud_files insert failed', insertError)
    return null
  }

  return (inserted?.id as string | undefined) ?? null
}

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

  if (!result.success || !result.publicUrl || !result.path) {
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

  const cloudFileId = await resolveCloudFileId(
    result.path,
    institutionId,
    userId,
    file.type,
    file.size,
    file.name,
  )

  if (!cloudFileId) {
    return {
      ok: false,
      code: 'upload_failed',
      error: 'Could not register uploaded image.',
    }
  }

  return {
    ok: true,
    data: {
      publicUrl: result.publicUrl,
      filepath: result.path,
      cloudFileId,
    },
  }
}
