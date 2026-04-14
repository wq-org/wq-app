import type { LucideIcon } from 'lucide-react'

import { Switch } from '@/components/ui/switch'

export type SwitchItem = {
  id: string
  label: string
  description?: string
  checked: boolean
  icon?: LucideIcon
}

type CompactSettingsTableSwitchesProps = {
  items: SwitchItem[]
  onCheckedChange: (id: string, checked: boolean) => void
  disabled?: boolean
}

export function CompactSettingsTableSwitches({
  items,
  onCheckedChange,
  disabled,
}: CompactSettingsTableSwitchesProps) {
  return (
    <div className="flex w-full flex-col">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <label
            key={item.id}
            htmlFor={item.id}
            className="flex cursor-pointer items-center justify-between border-b py-3 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              {Icon && (
                <Icon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{item.label}</span>
                {item.description && (
                  <span className="text-muted-foreground text-xs">{item.description}</span>
                )}
              </div>
            </div>
            <Switch
              id={item.id}
              checked={item.checked}
              disabled={disabled}
              onCheckedChange={(checked) => onCheckedChange(item.id, checked)}
              size="sm"
            />
          </label>
        )
      })}
    </div>
  )
}
