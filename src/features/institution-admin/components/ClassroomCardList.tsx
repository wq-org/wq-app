import { ClassroomCard } from './ClassroomCard'
import type { ClassroomRecord } from '../types/classroom.types'

export type ClassroomListItem = {
  readonly classroom: ClassroomRecord
  readonly classGroupName: string
  readonly facultyName: string
  readonly programmeName: string
  readonly cohortName: string
}

type ClassroomCardListProps = {
  readonly items: readonly ClassroomListItem[]
  readonly onOpenClassroom?: (classroomId: string) => void
}

export function ClassroomCardList({ items, onOpenClassroom }: ClassroomCardListProps) {
  return (
    <div className="flex flex-wrap gap-6">
      {items.map(({ classroom, classGroupName, facultyName, programmeName, cohortName }) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          classGroupName={classGroupName}
          facultyName={facultyName}
          programmeName={programmeName}
          cohortName={cohortName}
          onOpen={() => onOpenClassroom?.(classroom.id)}
        />
      ))}
    </div>
  )
}
