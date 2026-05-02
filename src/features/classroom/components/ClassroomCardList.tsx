import type { LucideIcon } from 'lucide-react'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { cn } from '@/lib/utils'

import { ClassroomCard } from './ClassroomCard'

export type ClassroomCardListItem = {
  readonly id: string
  readonly icon: LucideIcon
  readonly name: string
  readonly studentCount: number
}

type ClassroomCardListProps = {
  readonly items: readonly ClassroomCardListItem[]
  readonly onClassroomView?: (id: string) => void
  readonly className?: string
  readonly scrollAreaClassName?: string
}

export function ClassroomCardList({
  items,
  onClassroomView,
  className,
  scrollAreaClassName,
}: ClassroomCardListProps) {
  return (
    <BlurredScrollArea
      orientation="horizontal"
      hideScrollBar
      className={cn('w-full min-h-0', scrollAreaClassName)}
      viewportClassName="pb-1"
    >
      <div className={cn('flex w-max flex-nowrap gap-3', className)}>
        {items.map((item) => (
          <ClassroomCard
            key={item.id}
            id={item.id}
            icon={item.icon}
            name={item.name}
            studentCount={item.studentCount}
            onView={onClassroomView}
          />
        ))}
      </div>
    </BlurredScrollArea>
  )
}
