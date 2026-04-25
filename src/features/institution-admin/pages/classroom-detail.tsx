import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { AssignClassroomMemberDialog } from '../components/AssignClassroomMemberDialog'
import { ClassroomMembersTable } from '../components/ClassroomMembersTable'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useClassroomDetail } from '../hooks/useClassroomDetail'

export function ClassroomDetailPage() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { classroomId } = useParams<{ classroomId: string }>()
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const { classroom, members, isLoading, error, reload } = useClassroomDetail({
    classroomId: classroomId ?? null,
  })

  const handleBack = () => {
    navigate('/institution_admin/classrooms')
  }

  const isActive = classroom?.status === 'active'
  const statusLabel = isActive
    ? t('classrooms.card.statusActive')
    : t('classrooms.card.statusInactive')

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <AssignClassroomMemberDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          classroomId={classroom?.id ?? null}
          institutionId={classroom?.institution_id ?? null}
          onAssigned={reload}
        />

        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <Text
            as="span"
            variant="small"
            color="muted"
          >
            {t('classrooms.detail.back')}
          </Text>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : error ? (
          <Text
            as="p"
            variant="body"
            color="danger"
          >
            {error}
          </Text>
        ) : classroom ? (
          <>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Text
                  as="h1"
                  variant="h1"
                  className="text-2xl font-bold"
                >
                  {classroom.title}
                </Text>
                <Badge
                  variant={isActive ? 'green' : 'secondary'}
                  size="sm"
                >
                  {statusLabel}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Text
                  as="h2"
                  variant="h2"
                  className="text-lg font-semibold"
                >
                  {t('classrooms.members.title')}
                </Text>
                <Button
                  type="button"
                  variant="darkblue"
                  onClick={() => setIsAssignDialogOpen(true)}
                >
                  {t('classrooms.members.assignUser')}
                </Button>
              </div>
              <ClassroomMembersTable members={members} />
            </div>
          </>
        ) : (
          <Text
            as="p"
            variant="body"
            color="muted"
          >
            {t('classrooms.detail.notFound')}
          </Text>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
