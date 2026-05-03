import { Clock8Icon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type TimePickerWithIconProps = {
  label: string
  id: string
  step?: number
  defaultValue?: string
  className?: string
}

export function TimePickerWithIcon({
  label,
  id,
  step = 1,
  defaultValue = '08:30:00',
  className,
}: TimePickerWithIconProps) {
  return (
    <div className={cn('w-full max-w-xs space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Clock8Icon className="size-4" />
          <span className="sr-only">User</span>
        </div>
        <Input
          type="time"
          id={`${id}-time-picker`}
          name={`${id}-time-picker`}
          step={step}
          defaultValue={defaultValue}
          className={cn(
            'peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none',
            className,
          )}
        />
      </div>
    </div>
  )
}
