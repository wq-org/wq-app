import { Switch } from '@/components/ui/switch'

export type SwitchItem = {
  id: string
  label: string
  description?: string
  checked: boolean
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
      {items.map((item) => (
        <label
          key={item.id}
          htmlFor={item.id}
          className="flex cursor-pointer items-center justify-between border-b py-3 last:border-b-0"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{item.label}</span>
            {item.description && (
              <span className="text-muted-foreground text-xs">{item.description}</span>
            )}
          </div>
          <Switch
            id={item.id}
            checked={item.checked}
            disabled={disabled}
            onCheckedChange={(checked) => onCheckedChange(item.id, checked)}
            size="sm"
          />
        </label>
      ))}
    </div>
  )
}
