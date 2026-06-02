import type { ClassGroupRecord } from '../types/class-group.types'
import { ClassGroupCard } from './ClassGroupCard'

export type ClassGroupListItem = {
  classGroup: ClassGroupRecord
  cohortName: string
  facultyName: string
  programmeName: string
}

type ClassGroupCardListProps = {
  items: readonly ClassGroupListItem[]
  onOpenClassGroup?: (classGroupId: string) => void
}

export function ClassGroupCardList({ items, onOpenClassGroup }: ClassGroupCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ classGroup, cohortName, facultyName, programmeName }) => (
        <ClassGroupCard
          key={classGroup.id}
          classGroup={classGroup}
          cohortName={cohortName}
          facultyName={facultyName}
          programmeName={programmeName}
          onOpen={() => onOpenClassGroup?.(classGroup.id)}
        />
      ))}
    </div>
  )
}
