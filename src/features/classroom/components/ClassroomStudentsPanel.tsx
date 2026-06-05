import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LoadingPage } from '@/components/shared'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'

import { useClassroomStudents } from '../hooks/useClassroomStudents'
import type { ClassroomStudent } from '../types/classroom.types'
import { filterClassroomStudentsByQuery } from '../utils/classroomStudent.utils'
import { ClassroomAvatarItemList } from './ClassroomAvatarItemList'
import { ClassroomStudentDialog } from './ClassroomStudentDialog'

type ClassroomStudentsPanelProps = {
  classroomId: string
  parentLoading?: boolean
}

export function ClassroomStudentsPanel({
  classroomId,
  parentLoading = false,
}: ClassroomStudentsPanelProps) {
  const { t } = useTranslation('features.teacher')
  const { students, loading, error } = useClassroomStudents(classroomId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<ClassroomStudent | null>(null)

  const filteredStudents = useMemo(
    () => filterClassroomStudentsByQuery(students, searchQuery),
    [students, searchQuery],
  )

  const handleSelectStudent = (student: ClassroomStudent) => {
    setSelectedStudent(student)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedStudent(null)
    }
  }

  if (parentLoading || loading) {
    return (
      <LoadingPage
        variant="embedded"
        message={t('pages.classroomDetail.sections.studentsLoading')}
        size={72}
      />
    )
  }

  if (error) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-sm text-destructive"
      >
        {t('pages.classroomDetail.sections.studentsLoadError')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        label={t('pages.classroomDetail.sections.studentsSearchLabel')}
        placeholder={t('pages.classroomDetail.sections.studentsSearchPlaceholder')}
        labelVisibility="sr-only"
        showSearchIcon
        size="compact"
        className="max-w-md"
      />

      {filteredStudents.length === 0 ? (
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {searchQuery.trim()
            ? t('pages.classroomDetail.sections.studentsNoMatches')
            : t('pages.classroomDetail.sections.studentsEmpty')}
        </Text>
      ) : (
        <ClassroomAvatarItemList
          students={filteredStudents}
          onSelect={handleSelectStudent}
        />
      )}

      <ClassroomStudentDialog
        student={selectedStudent}
        open={selectedStudent !== null}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  )
}
