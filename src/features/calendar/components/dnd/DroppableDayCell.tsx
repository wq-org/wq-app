import { useDroppable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'

import type { ReactNode } from 'react'
import type { ICalendarCell } from '../../types/calendar.types'
import type { CalendarDropTarget } from './DnDProvider'

type DroppableDayCellProps = {
  cell: ICalendarCell
  children: ReactNode
}

export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  const dropTarget = { kind: 'day', date: cell.date } satisfies CalendarDropTarget
  const { setNodeRef, isOver } = useDroppable({
    id: `calendar-day-${cell.date.toISOString()}`,
    data: { dropTarget },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(isOver && 'bg-accent/50')}
    >
      {children}
    </div>
  )
}
