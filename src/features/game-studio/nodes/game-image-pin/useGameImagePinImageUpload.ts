import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { uploadFile } from '@/components/shared/upload-files/api/uploadFilesApi'
import { ALLOWED_IMAGE_TYPES } from '@/components/shared/upload-files/types/upload.types'
import { useUser } from '@/contexts/user/UserContext'

import { mapUserRoleToCloudPathRole } from './gameImagePinCloudRole'

export type GameImagePinCloudUploadResult = {
  publicUrl: string
  path: string
}

/**
 * Uploads a local image file to the institution cloud bucket (same pipeline as
 * `FileStepperForm` / lexical image insert). Intended for the Image Pin editor only.
 */
export function useGameImagePinImageUpload() {
  const { t } = useTranslation('features.gameStudio')
  const { getUserId, getUserInstitutionId, getRole } = useUser()

  const uploadGameImagePinFile = useCallback(
    async (file: File): Promise<GameImagePinCloudUploadResult | null> => {
      const institutionId = getUserInstitutionId()
      const userId = getUserId()
      const role = mapUserRoleToCloudPathRole(getRole())

      if (!institutionId?.trim() || !userId?.trim() || !role) {
        toast.error(t('imagePinEditor.toastUploadRequiresContext'))
        return null
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        toast.error(t('imagePinEditor.toastUploadInvalidType'))
        return null
      }

      const title = `game-image-pin-${Date.now()}`

      const result = await uploadFile({
        institutionId: institutionId.trim(),
        teacherId: userId.trim(),
        file,
        title,
        role,
      })

      if (!result.success || !result.publicUrl || !result.path) {
        toast.error(result.error ?? t('imagePinEditor.toastUploadFailed'))
        return null
      }

      toast.success(t('imagePinEditor.toastUploadSuccess'))
      return { publicUrl: result.publicUrl, path: result.path }
    },
    [getRole, getUserId, getUserInstitutionId, t],
  )

  return { uploadGameImagePinFile }
}
