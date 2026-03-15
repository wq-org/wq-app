import { useState } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Text } from '@/components/ui/text'
import { AccentPicker } from '@/components/shared'
import { settingsCapabilitiesByRole } from '../config/settingsCapabilities'
import { useSettingsProfileForm } from '../hooks/useSettingsProfileForm'
import type { SettingsFormValues, SettingsSaveValues } from '../types/settings.types'
import { USER_ROLES, type UserRole } from '@/features/auth'
import type { AvatarOption } from '@/features/onboarding'
import { SettingsAvatarSection } from './SettingsAvatarSection'
import { SettingsReadonlyFields } from './SettingsReadonlyFields'

type SettingsProfileFormProps = {
  role: UserRole
  initialValues: SettingsFormValues
  initialAvatarPath: string
  username: string
  email: string
  avatarOptions: AvatarOption[]
  linkedInError: string | null
  isSaving: boolean
  onLinkedInValidate: (value: string) => void
  onSave: (values: SettingsSaveValues) => Promise<void>
}

export function SettingsProfileForm({
  role,
  initialValues,
  initialAvatarPath,
  username,
  email,
  avatarOptions,
  linkedInError,
  isSaving,
  onLinkedInValidate,
  onSave,
}: SettingsProfileFormProps) {
  const { t } = useTranslation('settings')
  const capabilities = settingsCapabilitiesByRole[role]
  const { values, setField, isDirty, reset } = useSettingsProfileForm(initialValues)
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath)
  const hasAvatarChanges = avatarPath !== initialAvatarPath
  const hasChanges = isDirty || hasAvatarChanges
  const displayName = values.displayName.trim() || t('profile.fields.name.placeholder')
  const showAccentPicker = role === USER_ROLES.STUDENT || role === USER_ROLES.TEACHER

  const handleLinkedInValueChange = (nextValue: string) => {
    setField('linkedIn', nextValue)
    onLinkedInValidate(nextValue)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!hasChanges || linkedInError || isSaving) return

    await onSave({
      ...values,
      avatarPath,
    })
  }

  const handleReset = () => {
    reset()
    setAvatarPath(initialAvatarPath)
    onLinkedInValidate(initialValues.linkedIn)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-6xl flex-col gap-4 md:gap-6"
    >
      <SettingsAvatarSection
        avatarPath={avatarPath}
        displayName={displayName}
        avatarOptions={avatarOptions}
        canEditAvatar={capabilities.canEditAvatar}
        onAvatarSelect={setAvatarPath}
        title={t('profile.sections.avatarTitle')}
        hint={t('profile.sections.avatarHint')}
        className="w-full"
      />

      <div className="flex w-full flex-wrap items-stretch gap-4 md:gap-6">
        <FieldCard className="w-full md:min-w-[280px] md:flex-1">
          <div className="space-y-1">
            <Text
              as="h3"
              variant="h3"
            >
              {t('profile.sections.profileTitle')}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('profile.sections.profileHint')}
            </Text>
            {capabilities.showRoleHint ? (
              <Text
                as="p"
                variant="body"
                className="text-xs text-muted-foreground"
              >
                {t('profile.sections.roleHint', { role: t(`profile.roles.${role}`) })}
              </Text>
            ) : null}
          </div>
          <div className="mt-4 space-y-3">
            <FieldInput
              value={values.displayName}
              onValueChange={(value) => setField('displayName', value)}
              label={t('profile.fields.name.label')}
              placeholder={t('profile.fields.name.placeholder')}
            />
            <FieldInput
              value={values.linkedIn}
              onValueChange={handleLinkedInValueChange}
              label={t('profile.fields.linkedin.label')}
              placeholder={t('profile.fields.linkedin.placeholder')}
              disabled={!capabilities.canEditLinkedIn}
            />
            {linkedInError ? (
              <Text
                as="p"
                variant="body"
                className="text-sm text-red-500"
              >
                {linkedInError}
              </Text>
            ) : null}
            <FieldTextarea
              value={values.aboutMe}
              onValueChange={(value) => setField('aboutMe', value)}
              label={t('profile.fields.aboutMe.label')}
              placeholder={t('profile.fields.aboutMe.placeholder')}
              maxLength={500}
              rows={4}
              showCounter
            />
          </div>
        </FieldCard>
        <SettingsReadonlyFields
          username={username}
          email={email}
          title={t('profile.sections.accountTitle')}
          hint={t('profile.sections.accountHint')}
          usernameLabel={t('profile.fields.username.label')}
          usernamePlaceholder={t('profile.fields.username.placeholder')}
          emailLabel={t('profile.fields.email.label')}
          emailPlaceholder={t('profile.fields.email.placeholder')}
          className="w-full md:min-w-[280px] md:flex-1"
        />
      </div>

      {showAccentPicker ? (
        <FieldCard className="w-full">
          <div className="space-y-1">
            <Text
              as="h3"
              variant="h3"
            >
              {t('appearance.accentColor')}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('appearance.accentColor')}
            </Text>
          </div>
          <div className="mt-4">
            <AccentPicker />
          </div>
        </FieldCard>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSaving || !hasChanges}
        >
          {t('profile.actions.reset')}
        </Button>
        <Button
          type="submit"
          variant="darkblue"
          disabled={isSaving || !hasChanges || Boolean(linkedInError)}
        >
          <Check className="h-4 w-4" />
          {isSaving ? t('profile.actions.saving') : t('profile.actions.save')}
        </Button>
      </div>
    </form>
  )
}
