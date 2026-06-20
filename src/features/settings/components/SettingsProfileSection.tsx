import { Text } from '@/components/ui/text'
import { USER_ROLES } from '@/features/auth'
import { useSettingsProfilePage } from '../hooks/useSettingsProfilePage'
import type { SettingsProfileSectionProps } from '../types/settings.types'
import { SettingsLoadingState } from './SettingsLoadingState'
import { SettingsProfileForm } from './SettingsProfileForm'
import { InstitutionEmailChangeSection } from './InstitutionEmailChangeSection'

export function SettingsProfileSection({ role, embedded = false }: SettingsProfileSectionProps) {
  const {
    t,
    profile,
    loading,
    formKey,
    avatarOptions,
    linkedInError,
    isSaving,
    validateLinkedIn,
    handleSave,
  } = useSettingsProfilePage()

  return (
    <div className={embedded ? 'w-full' : 'w-full min-h-screen pb-32'}>
      <section className="animate-in fade-in-0 slide-in-from-bottom-4">
        <div
          className={
            embedded
              ? 'flex w-full flex-wrap items-start justify-center gap-6 py-0 md:py-2'
              : 'container flex w-full flex-wrap items-start justify-center gap-6 py-6 md:py-10'
          }
        >
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
            <div className="flex w-full max-w-6xl flex-col gap-4 md:gap-6">
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
                institution={profile.institution}
                avatarOptions={avatarOptions}
                linkedInError={linkedInError}
                isSaving={isSaving}
                onLinkedInValidate={validateLinkedIn}
                onSave={handleSave}
              />
              {role === USER_ROLES.INSTITUTION_ADMIN && profile.institution?.id ? (
                <InstitutionEmailChangeSection
                  institutionId={profile.institution.id}
                  currentEmail={profile.email ?? ''}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
