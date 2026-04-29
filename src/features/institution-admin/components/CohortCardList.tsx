import type { CohortRecord } from '../types/cohort.types'
import { CohortCard } from './CohortCard'

export type CohortListItem = {
  cohort: CohortRecord
  programmeName: string
  facultyName: string
}

type CohortCardListProps = {
  items: readonly CohortListItem[]
  onOpenCohort?: (cohortId: string) => void
}

export function CohortCardList({ items, onOpenCohort }: CohortCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ cohort, programmeName, facultyName }) => (
        <CohortCard
          key={cohort.id}
          cohort={cohort}
          programmeName={programmeName}
          facultyName={facultyName}
          onOpen={() => onOpenCohort?.(cohort.id)}
        />
      ))}
    </div>
  )
}
