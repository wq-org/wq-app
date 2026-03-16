import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Text } from '@/components/ui/text'
import { updateProfile } from '@/features/auth'
import { fetchAvatars, type AvatarOption } from '@/features/onboarding'
import { useUser } from '@/contexts/user'
import { validateLinkedInUrl } from '@/lib/validations'
import type { SettingsPageProps, SettingsSaveValues } from '../types/settings.types'
import { SettingsProfileForm } from '../components/SettingsProfileForm'
import { SettingsLoadingState } from '../components/SettingsLoadingState'

const SettingsPage = ({ role }: SettingsPageProps) => {
  const { t } = useTranslation('settings')
  const { profile, loading, getUserId, refreshProfile } = useUser()
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [linkedInError, setLinkedInError] = useState<string | null>(null)

  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const avatars = await fetchAvatars()
        setAvatarOptions(avatars)
      } catch (error) {
        console.error('Error loading avatars:', error)
        toast.error(t('profile.toasts.avatarLoadError'))
      }
    }

    void loadAvatars()
  }, [t])

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

  return (
    <div className="w-full min-h-screen">
      <section className="animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="container flex w-full flex-wrap items-start justify-center gap-6 py-6 md:py-10">
          {loading ? <SettingsLoadingState /> : null}

          {!loading && !profile ? (
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('profile.toasts.profileNotAvailable')}
            </Text>
          ) : null}

          {!loading && profile ? (
            <SettingsProfileForm
              key={formKey}
              role={role}
              initialValues={{
                displayName: profile.display_name ?? '',
                linkedIn: profile.linkedin_url ?? '',
                aboutMe: profile.description ?? '',
              }}
              initialAvatarPath={profile.avatar_url ?? ''}
              username={profile.username ?? ''}
              email={profile.email ?? ''}
              avatarOptions={avatarOptions}
              linkedInError={linkedInError}
              isSaving={isSaving}
              onLinkedInValidate={validateLinkedIn}
              onSave={handleSave}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}

export { SettingsPage }
