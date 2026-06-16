import { ClassroomCard } from './ClassroomCard'
import type { ClassroomRecord } from '../types/classroom.types'

export type ClassroomListItem = {
  readonly classroom: ClassroomRecord
}

type ClassroomCardListProps = {
  readonly items: readonly ClassroomListItem[]
  readonly onOpenClassroom?: (classroomId: string) => void
}

export function ClassroomCardList({ items, onOpenClassroom }: ClassroomCardListProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {items.map(({ classroom }) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          onOpen={() => onOpenClassroom?.(classroom.id)}
        />
      ))}
    </div>
  )
}
