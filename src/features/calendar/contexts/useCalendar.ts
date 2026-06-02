import { useContext } from 'react'

import { CalendarContext } from './CalendarContext'

import type { ICalendarContext } from './CalendarContext'

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext)
  if (!context) throw new Error('useCalendar must be used within a CalendarProvider.')
  return context
}
