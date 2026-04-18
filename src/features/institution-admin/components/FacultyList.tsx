import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'

import type { FacultySummary } from '../types/faculty.types.ts'

import { FacultyCard } from './FacultyCard'

type FacultyListProps = {
  faculties: readonly FacultySummary[]
  onOpenFaculty?: (facultyId: string) => void
}

export function FacultyList({ faculties, onOpenFaculty }: FacultyListProps) {
  const { t } = useTranslation('features.institution-admin')

  if (faculties.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-muted bg-muted/20 px-6 py-16 text-center">
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('faculties.empty')}
        </Text>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
