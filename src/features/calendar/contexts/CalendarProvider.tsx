import { useState } from 'react'

import { CalendarContext } from './CalendarContext'

import type { ReactNode } from 'react'
import type {
  IEvent,
  IUser,
  TBadgeVariant,
  TCalendarView,
  TVisibleHours,
  TWorkingHours,
} from '../types/calendar.types'
import type { TEventFormData } from '../schemas/event.schema'

const DEFAULT_WORKING_HOURS: TWorkingHours = {
  0: { from: 0, to: 0 },
  1: { from: 8, to: 17 },
  2: { from: 8, to: 17 },
  3: { from: 8, to: 17 },
  4: { from: 8, to: 17 },
  5: { from: 8, to: 17 },
  6: { from: 8, to: 12 },
}

const DEFAULT_VISIBLE_HOURS: TVisibleHours = { from: 7, to: 18 }

export type CalendarProviderProps = {
  children: ReactNode
  events: IEvent[]
  users: IUser[]

  view: TCalendarView
  onViewChange: (view: TCalendarView) => void

  selectedDate?: Date
  onSelectedDateChange?: (date: Date) => void

  onEventCreate?: (values: TEventFormData) => void | Promise<void>
  onEventUpdate?: (event: IEvent) => void | Promise<void>
  onEventDelete?: (eventId: IEvent['id']) => void | Promise<void>

  defaultBadgeVariant?: TBadgeVariant
  defaultWorkingHours?: TWorkingHours
  defaultVisibleHours?: TVisibleHours
}

export function CalendarProvider({
  children,
  events,
  users,
  view,
  onViewChange,
  selectedDate: controlledSelectedDate,
  onSelectedDateChange,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  defaultBadgeVariant = 'colored',
  defaultWorkingHours = DEFAULT_WORKING_HOURS,
  defaultVisibleHours = DEFAULT_VISIBLE_HOURS,
}: CalendarProviderProps) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>(defaultBadgeVariant)
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(defaultVisibleHours)
  const [workingHours, setWorkingHours] = useState<TWorkingHours>(defaultWorkingHours)

  const [internalSelectedDate, setInternalSelectedDate] = useState(
    controlledSelectedDate ?? new Date(),
  )
  const [selectedUserId, setSelectedUserId] = useState<IUser['id'] | 'all'>('all')

  const isDateControlled = controlledSelectedDate !== undefined
  const selectedDate = isDateControlled ? controlledSelectedDate : internalSelectedDate

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return
    if (!isDateControlled) setInternalSelectedDate(date)
    onSelectedDateChange?.(date)
  }

  return (
    <CalendarContext.Provider
      value={{
        view,
        onViewChange,
        selectedDate,
        setSelectedDate: handleSelectDate,
        selectedUserId,
        setSelectedUserId,
        badgeVariant,
        setBadgeVariant,
        users,
        events,
        visibleHours,
        setVisibleHours,
        workingHours,
        setWorkingHours,
        onEventCreate,
        onEventUpdate,
        onEventDelete,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}
