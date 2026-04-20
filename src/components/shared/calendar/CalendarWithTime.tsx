import { useState } from 'react'
import { Clock2Icon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

type CalendarWithTimeProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
}

export function CalendarWithTime({ value, onChange }: CalendarWithTimeProps) {
  const [startTime, setStartTime] = useState('10:30:00')
  const [endTime, setEndTime] = useState('12:30:00')

  return (
    <div className="flex flex-col">
      <div className="p-3">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          className="p-0"
        />
      </div>
      <div className="border-t bg-card p-3">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="time-from">Start Time</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="time-from"
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="time-to">End Time</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="time-to"
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </div>
    </div>
  )
}
