import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { updateProfile } from '@/features/auth'
import type { AvatarOption } from '@/features/onboarding'
import { useUser } from '@/contexts/user'
import { getAllAvatarOptions } from '@/lib/avatarHelpers'
import { validateLinkedInUrl } from '@/lib/validations'
import type { SettingsSaveValues } from '../types/settings.types'

export function useSettingsProfilePage() {
  const { t } = useTranslation('settings')
  const { profile, loading, getUserId, refreshProfile } = useUser()
  const [isSaving, setIsSaving] = useState(false)
  const [linkedInError, setLinkedInError] = useState<string | null>(null)

  const avatarOptions = useMemo<AvatarOption[]>(
    () =>
      getAllAvatarOptions().map((avatar) => ({
        ...avatar,
        description: avatar.description ?? '',
      })),
    [],
  )

  const formKey = useMemo(
    () =>
      [
        profile?.user_id ?? '',
        profile?.display_name ?? '',
        profile?.description ?? '',
        profile?.linkedin_url ?? '',
        profile?.avatar_url ?? '',
      ].join('|'),
    [
      profile?.avatar_url,
      profile?.description,
      profile?.display_name,
      profile?.linkedin_url,
      profile?.user_id,
    ],
  )

  const validateLinkedIn = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !validateLinkedInUrl(trimmed)) {
      setLinkedInError(t('profile.validation.linkedinInvalid'))
      return
    }
    setLinkedInError(null)
  }

  const handleSave = async (values: SettingsSaveValues) => {
    if (!profile) return

    validateLinkedIn(values.linkedIn)
    if (values.linkedIn.trim() && !validateLinkedInUrl(values.linkedIn.trim())) {
      toast.error(t('profile.validation.fixLinkedInBeforeSave'))
      return
    }

    const userId = getUserId()
    if (!userId) {
      toast.error(t('profile.toasts.userIdMissing'))
      return
    }

    const updatePayload: {
      display_name?: string
      description?: string
      avatar_url?: string
      linkedin_url?: string
    } = {}

    if (values.displayName !== (profile.display_name ?? '')) {
      updatePayload.display_name = values.displayName
    }
    if (values.aboutMe !== (profile.description ?? '')) {
      updatePayload.description = values.aboutMe
    }
    if (values.avatarPath !== (profile.avatar_url ?? '')) {
      updatePayload.avatar_url = values.avatarPath
    }
    if (values.linkedIn !== (profile.linkedin_url ?? '')) {
      updatePayload.linkedin_url = values.linkedIn.trim()
    }

    if (Object.keys(updatePayload).length === 0) return

    setIsSaving(true)
    try {
      await updateProfile(userId, updatePayload)
      await refreshProfile()
      toast.success(t('profile.toasts.saveSuccess'))
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(t('profile.toasts.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    t,
    profile,
    loading,
    formKey,
    avatarOptions,
    linkedInError,
    isSaving,
    validateLinkedIn,
    handleSave,
  }
}
