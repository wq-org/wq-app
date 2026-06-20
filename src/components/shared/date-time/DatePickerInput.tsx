'use client'

import { useEffect, useId, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { CalendarWithPresets } from '@/components/shared/calendar/CalendarWithPresets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import {
  displayDateToIso,
  ISO_DATE_FORMAT,
  isoToDate,
  isoToDisplayDate,
} from './date-picker-input.utils'

export type DatePickerInputProps = {
  id?: string
  label?: string
  value?: string
  onChange: (isoDate: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePickerInput({
  id,
  label,
  value = '',
  onChange,
  placeholder = '01.06.2026',
  disabled = false,
  className,
}: DatePickerInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [text, setText] = useState(() => isoToDisplayDate(value))
  const [open, setOpen] = useState(false)

  const selectedDate = isoToDate(value)

  useEffect(() => {
    setText(isoToDisplayDate(value))
  }, [value])

  const commitText = () => {
    if (text.trim() === '') {
      onChange('')
      return
    }

    const iso = displayDateToIso(text)
    if (iso) {
      onChange(iso)
      setText(isoToDisplayDate(iso))
      return
    }

    setText(isoToDisplayDate(value))
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return
    const iso = format(date, ISO_DATE_FORMAT)
    onChange(iso)
    setText(isoToDisplayDate(iso))
    setOpen(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <div className="flex w-fit items-center gap-1">
        <Input
          autoComplete="off"
          className="w-[9.5rem] shrink-0"
          disabled={disabled}
          id={inputId}
          inputMode="numeric"
          onBlur={commitText}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commitText()
            }
          }}
          placeholder={placeholder}
          value={text}
        />
        <Popover
          onOpenChange={setOpen}
          open={open}
        >
          <PopoverTrigger asChild>
            <Button
              aria-label={label ? `${label} calendar` : 'Open calendar'}
              disabled={disabled}
              size="icon"
              type="button"
              variant="ghost"
            >
              <CalendarIcon className="size-4 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-auto p-0"
          >
            <CalendarWithPresets
              compact
              onChange={handleCalendarSelect}
              value={selectedDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
