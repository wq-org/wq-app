import { useCalendar } from '../contexts/useCalendar'

import type { IEvent } from '../types/calendar.types'

export function useUpdateEvent() {
  const { onEventUpdate } = useCalendar()

  const updateEvent = (event: IEvent) => {
    const normalized: IEvent = {
      ...event,
      startDate: new Date(event.startDate).toISOString(),
      endDate: new Date(event.endDate).toISOString(),
    }

    onEventUpdate?.(normalized)
  }

  return { updateEvent }
}
