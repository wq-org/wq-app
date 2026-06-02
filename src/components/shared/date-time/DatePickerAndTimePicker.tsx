'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { CalendarWithPresets } from '@/components/shared/calendar/CalendarWithPresets'

type DateTimePickerProps = {
  label?: string
  id?: string
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  time?: string
  onTimeChange?: (time: string) => void
  className?: string
}

export function DateTimePicker({
  label = 'Date',
  id = 'date-time-picker',
  date,
  onDateChange,
  time,
  onTimeChange,
  className,
}: DateTimePickerProps) {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange?.(e.target.value)
  }

  return (
    <div className={cn('flex gap-4', className)}>
      <div className="flex flex-col gap-3">
        <Label htmlFor={`${id}-date`}>{label}</Label>
        <CalendarWithPresets
          value={date}
          onChange={onDateChange}
        />
      </div>
      <div className="flex flex-col gap-3">
        <Label
          htmlFor={`${id}-time`}
          className="px-1"
        >
          Time
        </Label>
        <Input
          type="time"
          id={`${id}-time`}
          step="1"
          value={time}
          onChange={handleTimeChange}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          autoComplete="off"
        />
      </div>
    </div>
  )
}
