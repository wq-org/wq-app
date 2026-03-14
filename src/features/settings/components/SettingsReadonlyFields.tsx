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
  className?: string
}

export function SettingsReadonlyFields({
  username,
  email,
  title,
  hint,
  usernameLabel,
  usernamePlaceholder,
  emailLabel,
  emailPlaceholder,
  className,
}: SettingsReadonlyFieldsProps) {
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
      </div>
    </FieldCard>
  )
}
