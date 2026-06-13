import { AppShell } from '@/components/layout'
import { Text } from '@/components/ui/text'
import { USER_ROLES } from '@/features/auth'
import {
  SettingsLoadingState,
  SettingsProfileForm,
  useSettingsProfilePage,
} from '@/features/settings'

const TeacherSettingsPage = () => {
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
    <AppShell role="teacher">
      <div className="w-full min-h-screen pb-32">
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
                role={USER_ROLES.TEACHER}
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
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

export { TeacherSettingsPage }
