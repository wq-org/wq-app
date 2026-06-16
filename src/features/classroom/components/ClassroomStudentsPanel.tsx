import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { requestOpenCommandAddDialog } from '@/features/command-palette'

import { useClassroomPendingInvites } from '../hooks/useClassroomPendingInvites'
import { useClassroomStudents } from '../hooks/useClassroomStudents'
import type { ClassroomStudent } from '../types/classroom.types'
import { filterClassroomStudentsByQuery } from '../utils/classroomStudent.utils'
import { ClassroomAvatarItemList } from './ClassroomAvatarItemList'
import { ClassroomPendingInviteAvatar } from './ClassroomPendingInviteAvatar'
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
  const { invites: pendingInvites } = useClassroomPendingInvites(classroomId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<ClassroomStudent | null>(null)

  const filteredStudents = useMemo(
    () => filterClassroomStudentsByQuery(students, searchQuery),
    [students, searchQuery],
  )

  const hasNoStudents = filteredStudents.length === 0
  const hasPendingInvites = pendingInvites.length > 0
  const isSearching = searchQuery.trim().length > 0

  const handleSelectStudent = (student: ClassroomStudent) => {
    setSelectedStudent(student)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedStudent(null)
    }
  }

  const handleInviteStudent = () => {
    requestOpenCommandAddDialog({ initialType: 'inviteStudent', classroomId })
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
      <div className="flex items-center gap-2">
        <FieldInput
          value={searchQuery}
          onValueChange={setSearchQuery}
          label={t('pages.classroomDetail.sections.studentsSearchLabel')}
          placeholder={t('pages.classroomDetail.sections.studentsSearchPlaceholder')}
          labelVisibility="sr-only"
          showSearchIcon
          size="compact"
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInviteStudent}
          aria-label={t('pages.classroomDetail.sections.studentsInviteAriaLabel')}
          className="ml-auto shrink-0 gap-2"
        >
          <Plus
            className="size-4 shrink-0"
            aria-hidden
          />
          {t('pages.classroomDetail.sections.studentsInviteCta')}
        </Button>
      </div>

      {hasNoStudents ? (
        <Text
          as="p"
          variant="body"
          className="text-sm text-muted-foreground"
        >
          {isSearching
            ? t('pages.classroomDetail.sections.studentsNoMatches')
            : t('pages.classroomDetail.sections.studentsEmpty')}
        </Text>
      ) : (
        <ClassroomAvatarItemList
          students={filteredStudents}
          onSelect={handleSelectStudent}
        />
      )}

      {hasPendingInvites && !isSearching ? (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <Text
            as="p"
            variant="small"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            {t('pages.classroomDetail.sections.studentsPendingHeading')}
          </Text>
          <div className="flex flex-wrap gap-3">
            {pendingInvites.map((invite) => (
              <ClassroomPendingInviteAvatar
                key={invite.id}
                invite={invite}
              />
            ))}
          </div>
        </div>
      ) : null}

      <ClassroomStudentDialog
        student={selectedStudent}
        open={selectedStudent !== null}
        onOpenChange={handleDialogOpenChange}
      />
    </div>
  )
}
