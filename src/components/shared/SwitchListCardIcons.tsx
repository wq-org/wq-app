import { Card } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { BellIcon, MailIcon, SmartphoneIcon, type LucideIcon } from 'lucide-react'

export type SwitchListCardIconsItem = {
  id: string
  label: string
  icon: LucideIcon
  checked?: boolean
}

export type SwitchListCardIconsProps = {
  items?: SwitchListCardIconsItem[]
  onCheckedChange?: (id: string, checked: boolean) => void
}

const DEFAULT_ITEMS: SwitchListCardIconsItem[] = [
  { id: 'push', label: 'Push notifications', icon: BellIcon, checked: true },
  { id: 'email', label: 'Email notifications', icon: MailIcon, checked: false },
  { id: 'sms', label: 'SMS notifications', icon: SmartphoneIcon, checked: false },
]

export function SwitchListCardIcons({
  items = DEFAULT_ITEMS,
  onCheckedChange,
}: SwitchListCardIconsProps) {
  return (
    <Card className="w-full max-w-xs p-0">
      <FieldGroup className="gap-0">
        {items.map((item, index) => {
          const Icon = item.icon

          return (
            <div key={item.id}>
              <Field>
                <FieldLabel className="justify-between px-4 py-3">
                  <FieldTitle className="flex items-center gap-2">
                    <Icon
                      aria-hidden="true"
                      className="size-4 opacity-60"
                    />
                    {item.label}
                  </FieldTitle>
                  <Switch
                    defaultChecked={item.checked}
                    onCheckedChange={(checked) => onCheckedChange?.(item.id, checked)}
                  />
                </FieldLabel>
              </Field>
              {index < items.length - 1 ? <Separator /> : null}
            </div>
          )
        })}
      </FieldGroup>
    </Card>
  )
}
