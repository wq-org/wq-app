import { SelectAvatarDrawer } from '@/components/shared'
import { FieldCard } from '@/components/ui/field-card'
import { Text } from '@/components/ui/text'
import type { AvatarOption } from '@/features/onboarding'
import { useTranslation } from 'react-i18next'

type SettingsAvatarSectionProps = {
  avatarPath: string
  displayName: string
  avatarOptions: AvatarOption[]
  canEditAvatar: boolean
  onAvatarSelect: (avatarPath: string) => void
  title: string
  hint: string
  className?: string
}

export function SettingsAvatarSection({
  avatarPath,
  displayName,
  avatarOptions,
  canEditAvatar,
  onAvatarSelect,
  title,
  hint,
  className,
}: SettingsAvatarSectionProps) {
  const { t } = useTranslation('settings')
  const displayNameInitial = displayName.charAt(0).toUpperCase() || 'A'
  const handleAvatarSelect = canEditAvatar ? onAvatarSelect : () => {}

  return (
    <FieldCard className={className}>
      <div className="space-y-2">
        <Text
          as="h2"
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
        <div className="relative mt-3 w-fit">
          <SelectAvatarDrawer
            avatarPath={avatarPath}
            selectedAvatarPath={avatarPath}
            displayNameInitial={displayNameInitial}
            displayName={displayName}
            avatarOptions={avatarOptions}
            drawerTitle={t('profile.avatarDrawer.title')}
            drawerDescription={t('profile.avatarDrawer.description')}
            triggerAriaLabel={t('profile.avatarDrawer.triggerAriaLabel')}
            closeLabel={t('profile.avatarDrawer.close')}
            getSelectAvatarLabel={(avatarName) =>
              t('profile.avatarDrawer.selectAriaLabel', { avatarName })
            }
            onAvatarSelect={handleAvatarSelect}
          />
          {!canEditAvatar ? (
            <div className="absolute inset-0 cursor-not-allowed rounded-full bg-background/40" />
          ) : null}
        </div>
      </div>
    </FieldCard>
  )
}
