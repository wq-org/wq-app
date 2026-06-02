export { CalendarContainer } from './components/CalendarContainer'
export { CalendarMonthView } from './components/month-view'
export { CalendarWeekView, CalendarDayView } from './components/week-and-day-view'
export { CalendarYearView } from './components/year-view'
export { CalendarAgendaView } from './components/agenda-view'
export { CalendarHeader } from './components/header'
export { AddEventDialog, EditEventDialog, EventDetailsDialog } from './components/dialogs'
export { DnDProvider } from './components/dnd'
export { BadgeVariantInput, VisibleHoursInput, WorkingHoursInput } from './components/settings'

export { CalendarProvider, useCalendar, CalendarContext } from './contexts'
export type { CalendarProviderProps, ICalendarContext } from './contexts'

export { useUpdateEvent } from './hooks'

export { eventSchema } from './schemas/event.schema'
export type { TEventFormData } from './schemas/event.schema'

export type {
  IEvent,
  IUser,
  ICalendarCell,
  TCalendarView,
  TEventColor,
  TBadgeVariant,
  TWorkingHours,
  TVisibleHours,
} from './types/calendar.types'
