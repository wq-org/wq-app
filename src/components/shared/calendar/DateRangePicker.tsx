import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type DateRangePickerProps = {
  label: string
  id?: string
  value: DateRange | undefined
  onChange: (next: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateRangePicker({
  label,
  id,
  value,
  onChange,
  placeholder = 'Pick a date range',
  className,
  disabled = false,
}: DateRangePickerProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  const summary =
    value?.from != null
      ? value.to != null
        ? `${format(value.from, 'LLL dd, y')} – ${format(value.to, 'LLL dd, y')}`
        : format(value.from, 'LLL dd, y')
      : null

  return (
    <Field className={cn('w-full max-w-md', className)}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={inputId}
            disabled={disabled}
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon
              data-icon="inline-start"
              className="mr-2 size-4 shrink-0 opacity-70"
              aria-hidden
            />
            {summary != null ? (
              <span>{summary}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
