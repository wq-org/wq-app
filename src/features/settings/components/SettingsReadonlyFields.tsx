import { useTranslation } from 'react-i18next'
import type { Profile } from '@/contexts/user'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'

type SettingsReadonlyFieldsProps = {
  username: string
  email: string
  title: string
  hint: string
  usernameLabel: string
  usernamePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  institution?: Profile['institution']
  className?: string
}

const EMPTY_PLACEHOLDER = '\u2014'

export function SettingsReadonlyFields({
  username,
  email,
  title,
  hint,
  usernameLabel,
  usernamePlaceholder,
  emailLabel,
  emailPlaceholder,
  institution,
  className,
}: SettingsReadonlyFieldsProps) {
  const { t } = useTranslation('settings')

  const institutionNameDisplay = institution?.name?.trim()
    ? institution.name.trim()
    : EMPTY_PLACEHOLDER
  const institutionSlugDisplay = institution?.slug?.trim()
    ? institution.slug.trim()
    : EMPTY_PLACEHOLDER
  const institutionEmailDisplay = institution?.email?.trim()
    ? institution.email.trim()
    : EMPTY_PLACEHOLDER

  return (
    <FieldCard className={className}>
      <div className="space-y-1">
        <Text
          as="h3"
          variant="h3"
        >
          {title}
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {hint}
        </Text>
      </div>
      <div className="mt-4 space-y-3">
        <FieldInput
          value={username}
          label={usernameLabel}
          placeholder={usernamePlaceholder}
          disabled
        />
        <FieldInput
          value={email}
          label={emailLabel}
          placeholder={emailPlaceholder}
          disabled
        />
        {institution ? (
          <div
            className="space-y-4 border-t border-border pt-4"
            aria-label={t('profile.sections.institutionTitle')}
          >
            <div className="space-y-1">
              <Text
                as="h4"
                variant="small"
                bold
                className="text-foreground"
              >
                {t('profile.sections.institutionTitle')}
              </Text>
              <Text
                as="p"
                variant="small"
                muted
              >
                {t('profile.sections.institutionHint')}
              </Text>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('profile.fields.institutionName.label')}
                </Text>
                <Text
                  as="p"
                  variant="body"
                >
                  {institutionNameDisplay}
                </Text>
              </div>
              <div className="space-y-1">
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('profile.fields.institutionSlug.label')}
                </Text>
                <Text
                  as="p"
                  variant="body"
                  className="font-mono text-sm"
                >
                  {institutionSlugDisplay}
                </Text>
              </div>
              <div className="space-y-1">
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('profile.fields.institutionEmail.label')}
                </Text>
                <Text
                  as="p"
                  variant="body"
                >
                  {institutionEmailDisplay}
                </Text>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </FieldCard>
  )
}
