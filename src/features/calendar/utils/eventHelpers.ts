import {
  differenceInDays,
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns'

import type { IEvent, TVisibleHours, TWorkingHours } from '../types/calendar.types'

export function getCurrentEvents(events: IEvent[]) {
  const now = new Date()
  return (
    events.filter((event) =>
      isWithinInterval(now, { start: parseISO(event.startDate), end: parseISO(event.endDate) }),
    ) || null
  )
}

export function groupEvents(dayEvents: IEvent[]) {
  const sortedEvents = dayEvents.sort(
    (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
  )
  const groups: IEvent[][] = []

  for (const event of sortedEvents) {
    const eventStart = parseISO(event.startDate)

    let placed = false
    for (const group of groups) {
      const lastEventInGroup = group[group.length - 1]
      const lastEventEnd = parseISO(lastEventInGroup.endDate)

      if (eventStart >= lastEventEnd) {
        group.push(event)
        placed = true
        break
      }
    }

    if (!placed) groups.push([event])
  }

  return groups
}

export function getEventBlockStyle(
  event: IEvent,
  day: Date,
  groupIndex: number,
  groupSize: number,
  visibleHoursRange?: { from: number; to: number },
) {
  const startDate = parseISO(event.startDate)
  const dayStart = new Date(day.setHours(0, 0, 0, 0))
  const eventStart = startDate < dayStart ? dayStart : startDate
  const startMinutes = differenceInMinutes(eventStart, dayStart)

  let top

  if (visibleHoursRange) {
    const visibleStartMinutes = visibleHoursRange.from * 60
    const visibleEndMinutes = visibleHoursRange.to * 60
    const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes
    top = ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100
  } else {
    top = (startMinutes / 1440) * 100
  }

  const width = 100 / groupSize
  const left = groupIndex * width

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` }
}

export function isWorkingHour(day: Date, hour: number, workingHours: TWorkingHours) {
  const dayIndex = day.getDay() as keyof typeof workingHours
  const dayHours = workingHours[dayIndex]
  return hour >= dayHours.from && hour < dayHours.to
}

export function getVisibleHours(visibleHours: TVisibleHours, singleDayEvents: IEvent[]) {
  let earliestEventHour = visibleHours.from
  let latestEventHour = visibleHours.to

  singleDayEvents.forEach((event) => {
    const startHour = parseISO(event.startDate).getHours()
    const endTime = parseISO(event.endDate)
    const endHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0)
    if (startHour < earliestEventHour) earliestEventHour = startHour
    if (endHour > latestEventHour) latestEventHour = endHour
  })

  latestEventHour = Math.min(latestEventHour, 24)

  const hours = Array.from(
    { length: latestEventHour - earliestEventHour },
    (_, i) => i + earliestEventHour,
  )

  return { hours, earliestEventHour, latestEventHour }
}

export function calculateMonthEventPositions(
  multiDayEvents: IEvent[],
  singleDayEvents: IEvent[],
  selectedDate: Date,
) {
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)

  const eventPositions: { [key: string]: number } = {}
  const occupiedPositions: { [key: string]: boolean[] } = {}

  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
    occupiedPositions[day.toISOString()] = [false, false, false]
  })

  const sortedEvents = [
    ...multiDayEvents.sort((a, b) => {
      const aDuration = differenceInDays(parseISO(a.endDate), parseISO(a.startDate))
      const bDuration = differenceInDays(parseISO(b.endDate), parseISO(b.startDate))
      return (
        bDuration - aDuration || parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
      )
    }),
    ...singleDayEvents.sort(
      (a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
    ),
  ]

  sortedEvents.forEach((event) => {
    const eventStart = parseISO(event.startDate)
    const eventEnd = parseISO(event.endDate)
    const eventDays = eachDayOfInterval({
      start: eventStart < monthStart ? monthStart : eventStart,
      end: eventEnd > monthEnd ? monthEnd : eventEnd,
    })

    let position = -1

    for (let i = 0; i < 3; i++) {
      if (
        eventDays.every((day) => {
          const dayPositions = occupiedPositions[startOfDay(day).toISOString()]
          return dayPositions && !dayPositions[i]
        })
      ) {
        position = i
        break
      }
    }

    if (position !== -1) {
      eventDays.forEach((day) => {
        const dayKey = startOfDay(day).toISOString()
        occupiedPositions[dayKey][position] = true
      })
      eventPositions[event.id] = position
    }
  })

  return eventPositions
}

export function getMonthCellEvents(
  date: Date,
  events: IEvent[],
  eventPositions: Record<string, number>,
) {
  const eventsForDate = events.filter((event) => {
    const eventStart = parseISO(event.startDate)
    const eventEnd = parseISO(event.endDate)
    return (
      (date >= eventStart && date <= eventEnd) ||
      isSameDay(date, eventStart) ||
      isSameDay(date, eventEnd)
    )
  })

  return eventsForDate
    .map((event) => ({
      ...event,
      position: eventPositions[event.id] ?? -1,
      isMultiDay: event.startDate !== event.endDate,
    }))
    .sort((a, b) => {
      if (a.isMultiDay && !b.isMultiDay) return -1
      if (!a.isMultiDay && b.isMultiDay) return 1
      return a.position - b.position
    })
}
