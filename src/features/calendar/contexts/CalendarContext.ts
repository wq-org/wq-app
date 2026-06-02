import { createContext } from 'react'

import type { Dispatch, SetStateAction } from 'react'
import type {
  IEvent,
  IUser,
  TBadgeVariant,
  TCalendarView,
  TVisibleHours,
  TWorkingHours,
} from '../types/calendar.types'
import type { TEventFormData } from '../schemas/event.schema'

export type ICalendarContext = {
  view: TCalendarView
  onViewChange: (view: TCalendarView) => void

  selectedDate: Date
  setSelectedDate: (date: Date | undefined) => void

  selectedUserId: IUser['id'] | 'all'
  setSelectedUserId: (userId: IUser['id'] | 'all') => void

  badgeVariant: TBadgeVariant
  setBadgeVariant: (variant: TBadgeVariant) => void

  users: IUser[]
  events: IEvent[]

  workingHours: TWorkingHours
  setWorkingHours: Dispatch<SetStateAction<TWorkingHours>>

  visibleHours: TVisibleHours
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>

  onEventCreate?: (values: TEventFormData) => void | Promise<void>
  onEventUpdate?: (event: IEvent) => void | Promise<void>
  onEventDelete?: (eventId: IEvent['id']) => void | Promise<void>
}

export const CalendarContext = createContext<ICalendarContext | null>(null)
