import { useDroppable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'
import type { CalendarDropTarget } from './DnDProvider'

type DroppableTimeBlockProps = {
  date: Date
  hour: number
  minute: number
  children: ReactNode
}

export function DroppableTimeBlock({ date, hour, minute, children }: DroppableTimeBlockProps) {
  const dropTarget = { kind: 'time', date, hour, minute } satisfies CalendarDropTarget
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-time-${date.toISOString()}-${hour}-${minute}`,
    data: { dropTarget },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn('h-[24px]', isOver && 'bg-accent/50')}
    >
      {children}
    </div>
  )
}
