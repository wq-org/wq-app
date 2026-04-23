import type { FacultySummary } from '../types/faculty.types'

import { FacultyCard } from './FacultyCard'

type FacultyCardProps = {
  faculties: readonly FacultySummary[]
  onOpenFaculty?: (facultyId: string) => void
}

export function FacultyCardList({ faculties, onOpenFaculty }: FacultyCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
      {faculties.map((faculty) => (
        <FacultyCard
          key={faculty.id}
          name={faculty.name}
          description={faculty.description}
          onOpen={() => onOpenFaculty?.(faculty.id)}
        />
      ))}
    </div>
  )
}
