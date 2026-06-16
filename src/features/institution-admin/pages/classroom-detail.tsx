import { ArrowLeft, GraduationCap, Settings, UserRoundPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { SelectTabs, type TabItem } from '@/components/shared/tabs/SelectTabs'

import { updateClassroom, withdrawClassroomMember } from '../api/classroomsApi'
import { AssignCoTeachersDialog } from '../components/AssignCoTeachersDialog'
import { AssignStudentsDialog } from '../components/AssignStudentsDialog'
import { ClassroomMembersTable } from '../components/ClassroomMembersTable'
import { ClassroomSettings } from '../components/ClassroomSettings'
import { CoTeachersCard } from '../components/CoTeachersCard'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { MainTeacherCard } from '../components/MainTeacherCard'
import { ReassignMainTeacherDialog } from '../components/ReassignMainTeacherDialog'
import { WithdrawFromClassDialog } from '../components/WithdrawFromClassDialog'
import { useClassroomDetail } from '../hooks/useClassroomDetail'
import type { ClassroomMember } from '../types/classroom.types'
import { getCoTeacherExclusions, getMainTeacherExclusions, getStudentExclusions } from '../utils'

const TAB_MEMBERS = 'members'
const TAB_SETTINGS = 'settings'

export function ClassroomDetailPage() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { classroomId } = useParams<{ classroomId: string }>()
  const [isAssignActionsOpen, setIsAssignActionsOpen] = useState(false)
  const [isAssignCoTeachersDialogOpen, setIsAssignCoTeachersDialogOpen] = useState(false)
  const [isAssignStudentsDialogOpen, setIsAssignStudentsDialogOpen] = useState(false)
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [memberToKickOut, setMemberToKickOut] = useState<ClassroomMember | null>(null)
  const [activeTabId, setActiveTabId] = useState<string>(TAB_MEMBERS)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

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
  const primaryTeacher =
    members.find((member) => member.userId === classroom?.primary_teacher_id) ?? null
  const coTeachers = useMemo(() => {
    const primaryId = classroom?.primary_teacher_id
    return members.filter((member) => member.role === 'co_teacher' && member.userId !== primaryId)
  }, [members, classroom?.primary_teacher_id])
  const mainTeacherExcludeUserIds = useMemo(
    () => getMainTeacherExclusions(members, classroom?.primary_teacher_id ?? null),
    [members, classroom?.primary_teacher_id],
  )
  const coTeacherExcludeUserIds = useMemo(
    () => getCoTeacherExclusions(members, classroom?.primary_teacher_id ?? null),
    [members, classroom?.primary_teacher_id],
  )
  const studentExcludeUserIds = useMemo(() => getStudentExclusions(members), [members])
  const tableMembers = useMemo(() => {
    const primaryId = classroom?.primary_teacher_id
    return members.filter((member) => member.userId !== primaryId && member.role !== 'co_teacher')
  }, [members, classroom?.primary_teacher_id])

  const tabs: readonly TabItem[] = [
    { id: TAB_MEMBERS, icon: Users, title: t('classrooms.detail.tabs.members') },
    { id: TAB_SETTINGS, icon: Settings, title: t('classrooms.detail.tabs.settings') },
  ]

  const handleSaveTitle = async (nextTitle: string) => {
    if (!classroom) return
    setIsSavingSettings(true)
    setSettingsError(null)
    try {
      await updateClassroom({ classroomId: classroom.id, title: nextTitle })
      reload()
    } catch (saveErr) {
      setSettingsError(
        saveErr instanceof Error ? saveErr.message : t('classrooms.settings.saveError'),
      )
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleUnassignMainTeacher = async () => {
    if (!classroom) return
    setIsSavingSettings(true)
    setSettingsError(null)
    try {
      await updateClassroom({ classroomId: classroom.id, primaryTeacherId: null })
      reload()
    } catch (saveErr) {
      setSettingsError(
        saveErr instanceof Error ? saveErr.message : t('classrooms.settings.saveError'),
      )
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleConfirmKickOut = async () => {
    if (!memberToKickOut) return
    try {
      await withdrawClassroomMember(memberToKickOut.id)
      setMemberToKickOut(null)
      reload()
    } catch (kickErr) {
      setSettingsError(
        kickErr instanceof Error ? kickErr.message : t('classrooms.settings.saveError'),
      )
      setMemberToKickOut(null)
    }
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <ReassignMainTeacherDialog
          open={isReassignDialogOpen}
          onOpenChange={setIsReassignDialogOpen}
          classroomId={classroom?.id ?? null}
          institutionId={classroom?.institution_id ?? null}
          excludeUserIds={mainTeacherExcludeUserIds}
          onReassigned={reload}
        />

        <AssignCoTeachersDialog
          open={isAssignCoTeachersDialogOpen}
          onOpenChange={setIsAssignCoTeachersDialogOpen}
          classroomId={classroom?.id ?? null}
          institutionId={classroom?.institution_id ?? null}
          excludeUserIds={coTeacherExcludeUserIds}
          onAssigned={reload}
        />

        <AssignStudentsDialog
          open={isAssignStudentsDialogOpen}
          onOpenChange={setIsAssignStudentsDialogOpen}
          classroomId={classroom?.id ?? null}
          institutionId={classroom?.institution_id ?? null}
          excludeUserIds={studentExcludeUserIds}
          onAssigned={reload}
        />

        <WithdrawFromClassDialog
          open={memberToKickOut !== null}
          membershipRole={memberToKickOut?.role ?? ''}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setMemberToKickOut(null)
          }}
          onConfirmWithdraw={handleConfirmKickOut}
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

            <SelectTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={setActiveTabId}
            />

            {activeTabId === TAB_MEMBERS ? (
              <div className="flex flex-col gap-4">
                <MainTeacherCard
                  primaryTeacher={primaryTeacher}
                  onSelectTeacher={() => setIsReassignDialogOpen(true)}
                  onRemove={handleUnassignMainTeacher}
                  isBusy={isSavingSettings}
                />

                <CoTeachersCard
                  coTeachers={coTeachers}
                  onRemove={(member) => setMemberToKickOut(member)}
                />

                <div className="flex items-center justify-between gap-4">
                  <Text
                    as="h2"
                    variant="h2"
                    className="text-lg font-semibold"
                  >
                    {t('classrooms.members.title')}
                  </Text>
                  <Popover
                    open={isAssignActionsOpen}
                    onOpenChange={setIsAssignActionsOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="darkblue"
                      >
                        <UserRoundPlus />
                        {t('classrooms.members.assignUser')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-56 p-2"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                          onClick={() => {
                            setIsAssignActionsOpen(false)
                            setIsAssignCoTeachersDialogOpen(true)
                          }}
                        >
                          <Users className="size-4" />
                          {t('classrooms.detail.assignActions.assignCoTeachers')}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                          onClick={() => {
                            setIsAssignActionsOpen(false)
                            setIsAssignStudentsDialogOpen(true)
                          }}
                        >
                          <GraduationCap className="size-4" />
                          {t('classrooms.detail.assignActions.assignStudents')}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <ClassroomMembersTable
                  members={tableMembers}
                  onKickOut={(member) => setMemberToKickOut(member)}
                />
              </div>
            ) : (
              <ClassroomSettings
                classroom={classroom}
                isSaving={isSavingSettings}
                saveError={settingsError}
                onSaveTitle={handleSaveTitle}
              />
            )}
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
