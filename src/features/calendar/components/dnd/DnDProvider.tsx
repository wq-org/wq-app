import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { differenceInMilliseconds, parseISO } from 'date-fns'
import { useState } from 'react'

import { useUpdateEvent } from '../../hooks/useUpdateEvent'

import type { ReactNode } from 'react'
import type { IEvent } from '../../types/calendar.types'

export type CalendarDragItem = {
  event: IEvent
  children: ReactNode
}

export type CalendarDropTarget =
  | {
      kind: 'day'
      date: Date
    }
  | {
      kind: 'time'
      date: Date
      hour: number
      minute: number
    }

type DnDProviderProps = {
  children: ReactNode
}

function getDragItem(event: DragStartEvent | DragEndEvent): CalendarDragItem | null {
  const dragItem = event.active.data.current?.dragItem
  return dragItem && typeof dragItem === 'object' && 'event' in dragItem
    ? (dragItem as CalendarDragItem)
    : null
}

function getDropTarget(event: DragEndEvent): CalendarDropTarget | null {
  const dropTarget = event.over?.data.current?.dropTarget
  return dropTarget && typeof dropTarget === 'object' && 'kind' in dropTarget
    ? (dropTarget as CalendarDropTarget)
    : null
}

function buildMovedEvent(event: IEvent, target: CalendarDropTarget): IEvent {
  const eventStartDate = parseISO(event.startDate)
  const eventEndDate = parseISO(event.endDate)
  const eventDurationMs = differenceInMilliseconds(eventEndDate, eventStartDate)

  const newStartDate = new Date(target.date)
  if (target.kind === 'day') {
    newStartDate.setHours(
      eventStartDate.getHours(),
      eventStartDate.getMinutes(),
      eventStartDate.getSeconds(),
      eventStartDate.getMilliseconds(),
    )
  } else {
    newStartDate.setHours(target.hour, target.minute, 0, 0)
  }

  return {
    ...event,
    startDate: newStartDate.toISOString(),
    endDate: new Date(newStartDate.getTime() + eventDurationMs).toISOString(),
  }
}

export function DnDProvider({ children }: DnDProviderProps) {
  const { updateEvent } = useUpdateEvent()
  const [activeItem, setActiveItem] = useState<CalendarDragItem | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(getDragItem(event))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const dragItem = getDragItem(event)
    const dropTarget = getDropTarget(event)

    setActiveItem(null)
    if (!dragItem || !dropTarget) return

    updateEvent(buildMovedEvent(dragItem.event, dropTarget))
  }

  const handleDragCancel = () => {
    setActiveItem(null)
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>{activeItem ? activeItem.children : null}</DragOverlay>
    </DndContext>
  )
}
