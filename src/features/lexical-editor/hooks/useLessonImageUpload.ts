import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useUser } from '@/contexts/user/UserContext'

import {
  uploadLessonImage,
  type LessonImageUploadErrorCode,
  type LessonImageUploadResult,
} from '../api/lessonImageApi'
import { roleForUpload } from '../utils/roleForUpload'

function toastForUploadError(
  code: LessonImageUploadErrorCode,
  fallbackMessage: string,
  t: (key: string) => string,
): void {
  switch (code) {
    case 'already_exists':
      toast.info(fallbackMessage || t('editor.image.alreadyExistsInCloud'))
      return
    case 'missing_context':
      toast.error(t('editor.image.uploadRequiresContext'))
      return
    case 'invalid_type':
      toast.error(t('editor.image.invalidType'))
      return
    case 'upload_failed':
    default:
      toast.error(fallbackMessage || t('editor.image.uploadFailed'))
  }
}

export function useLessonImageUpload() {
  const { t } = useTranslation('features.lesson')
  const { getRole, getUserId, getUserInstitutionId } = useUser()
  const [isUploading, setIsUploading] = useState(false)

  const uploadLessonImageFile = useCallback(
    async (file: File): Promise<LessonImageUploadResult | null> => {
      const institutionId = getUserInstitutionId()
      const userId = getUserId()
      const role = roleForUpload(getRole())

      setIsUploading(true)
      try {
        const response = await uploadLessonImage(file, {
          institutionId: institutionId ?? '',
          userId: userId ?? '',
          role: role ?? '',
        })

        if (!response.ok) {
          toastForUploadError(response.code, response.error, t)
          return null
        }

        toast.success(t('editor.image.uploadSuccess'))
        return response.data
      } finally {
        setIsUploading(false)
      }
    },
    [getRole, getUserId, getUserInstitutionId, t],
  )

  return { isUploading, uploadLessonImageFile }
}
