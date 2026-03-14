import { AvatarDrawer } from '@/components/shared'
import { FieldCard } from '@/components/ui/field-card'
import { Text } from '@/components/ui/text'
import type { AvatarOption } from '@/features/onboarding'

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
  const displayNameInitial = displayName.charAt(0).toUpperCase() || 'A'

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
          <AvatarDrawer
            avatarPath={avatarPath}
            selectedAvatarPath={avatarPath}
            displayNameInitial={displayNameInitial}
            displayName={displayName}
            avatarOptions={avatarOptions}
            onAvatarSelect={canEditAvatar ? onAvatarSelect : () => {}}
          />
          {!canEditAvatar ? (
            <div className="absolute inset-0 cursor-not-allowed rounded-full bg-background/40" />
          ) : null}
        </div>
      </div>
    </FieldCard>
  )
}
