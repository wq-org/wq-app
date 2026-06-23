import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'

export type AgentImageUploadContext = {
  institutionId: string
  teacherId: string
  role: string
}

/**
 * Uploads a cropped PDF region (Blob) through the shared institution cloud
 * pipeline so the file is path-scoped, RLS-checked, and discoverable via the
 * same `cloud_files` registry the rest of the app uses.
 */
export async function uploadAgentCropToStorage(
  blob: Blob,
  context: AgentImageUploadContext,
): Promise<string> {
  const ext = blob.type === 'image/webp' ? 'webp' : 'png'
  const fileName = `agent-crop-${Date.now()}.${ext}`
  const file = new File([blob], fileName, { type: blob.type })

  const result = await uploadFile({
    institutionId: context.institutionId,
    teacherId: context.teacherId,
    file,
    title: fileName,
    role: context.role,
  })

  if (!result.success || !result.publicUrl) {
    throw new Error(result.error ?? 'Upload failed')
  }

  return result.publicUrl
}

/** Alias kept for hooks/docs that still reference the original PDF image upload name. */
export const uploadPdfImageToStorage = uploadAgentCropToStorage
