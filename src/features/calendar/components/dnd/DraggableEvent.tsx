import { useDraggable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'
import type { IEvent } from '../../types/calendar.types'
import type { CalendarDragItem } from './DnDProvider'

type DraggableEventProps = {
  event: IEvent
  children: ReactNode
}

export function DraggableEvent({ event, children }: DraggableEventProps) {
  const dragItem = { event, children } satisfies CalendarDragItem
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `calendar-event-${event.id}`,
    data: { dragItem },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}
