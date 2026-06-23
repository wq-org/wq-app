import { useCallback } from 'react'
import { useGameEditorContext } from '@/contexts/game-studio'
import { useUser } from '@/contexts/user'

import { mapUserRoleToCloudPathRole } from '../../nodes/game-image-pin/hooks/imagePinCloudRole'
import { uploadAgentCropToStorage } from '../api/agentAssetUploadApi'

export function useAgentInsertion() {
  const context = useGameEditorContext()
  const { profile, getUserId, getRole } = useUser()

  const insertText = useCallback(
    (fieldKey: string, text: string) => {
      const fields = context?.getActiveNodeFields() ?? []
      const field = fields.find((f) => f.fieldKey === fieldKey)
      field?.setValue(text)
    },
    [context],
  )

  const insertImage = useCallback(
    async (fieldKey: string, blob: Blob) => {
      const institutionId = profile?.userInstitutionId
      const teacherId = getUserId()
      const role = mapUserRoleToCloudPathRole(getRole())
      if (!institutionId || !teacherId || !role) return

      const fields = context?.getActiveNodeFields() ?? []
      const field = fields.find((f) => f.fieldKey === fieldKey && f.type === 'image')
      if (!field) return

      const url = await uploadAgentCropToStorage(blob, { institutionId, teacherId, role })
      field.setValue(url)
    },
    [context, getRole, getUserId, profile?.userInstitutionId],
  )

  return { insertText, insertImage }
}
