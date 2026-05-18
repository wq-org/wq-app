import { useMemo } from 'react'

import { useCalendar } from '../../contexts/useCalendar'

import { MonthDayCell } from './MonthDayCell'

import { getCalendarCells } from '../../utils/dateHelpers'
import { calculateMonthEventPositions } from '../../utils/eventHelpers'

import type { IEvent } from '../../types/calendar.types'

type CalendarMonthViewProps = {
  singleDayEvents: IEvent[]
  multiDayEvents: IEvent[]
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: CalendarMonthViewProps) {
  const { selectedDate } = useCalendar()

  const allEvents = [...multiDayEvents, ...singleDayEvents]

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate])

  const eventPositions = useMemo(
    () => calculateMonthEventPositions(multiDayEvents, singleDayEvents, selectedDate),
    [multiDayEvents, singleDayEvents, selectedDate],
  )

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center py-2"
          >
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map((cell) => (
          <MonthDayCell
            key={cell.date.toISOString()}
            cell={cell}
            events={allEvents}
            eventPositions={eventPositions}
          />
        ))}
      </div>
    </div>
  )
}
