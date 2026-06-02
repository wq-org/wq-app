import type { ProgrammeRecord } from '../types/programme.types'

import { FacultyProgrammeCard } from './FacultyProgrammeCard'

export type FacultyProgrammeListItem = {
  programme: ProgrammeRecord
  facultyName: string
}

type FacultyProgrammeCardListProps = {
  items: readonly FacultyProgrammeListItem[]
  onOpenProgramme?: (programmeId: string) => void
}

export function FacultyProgrammeCardList({
  items,
  onOpenProgramme,
}: FacultyProgrammeCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ programme, facultyName }) => (
        <FacultyProgrammeCard
          key={programme.id}
          facultyName={facultyName}
          programmeName={programme.name}
          programmeDescription={programme.description}
          durationYears={programme.duration_years}
          onOpen={() => onOpenProgramme?.(programme.id)}
        />
      ))}
    </div>
  )
}
