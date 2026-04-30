import { ArrowLeft, Settings, UserRoundPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { SelectTabs, type TabItem } from '@/components/shared/tabs/SelectTabs'

import { updateClassroom, withdrawClassroomMember } from '../api/classroomsApi'
import { AssignClassroomMemberDialog } from '../components/AssignClassroomMemberDialog'
import { ClassroomMembersTable } from '../components/ClassroomMembersTable'
import { ClassroomSettings } from '../components/ClassroomSettings'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { ReassignMainTeacherDialog } from '../components/ReassignMainTeacherDialog'
import { WithdrawFromClassDialog } from '../components/WithdrawFromClassDialog'
import { useClassroomDetail } from '../hooks/useClassroomDetail'
import type { ClassroomMember } from '../types/classroom.types'
import { getInitial } from '../utils'

const TAB_MEMBERS = 'members'
const TAB_SETTINGS = 'settings'

export function ClassroomDetailPage() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { classroomId } = useParams<{ classroomId: string }>()
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [memberToKickOut, setMemberToKickOut] = useState<ClassroomMember | null>(null)
  const [activeTabId, setActiveTabId] = useState<string>(TAB_MEMBERS)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  const { classroom, members, breadcrumb, isLoading, error, reload } = useClassroomDetail({
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
  const tableMembers = useMemo(() => {
    const primaryId = classroom?.primary_teacher_id
    if (!primaryId) return members
    return members.filter((member) => member.userId !== primaryId)
  }, [members, classroom?.primary_teacher_id])
  const primaryTeacherName = primaryTeacher?.name ?? t('classrooms.detail.mainTeacher.unassigned')
  const primaryTeacherEmail = primaryTeacher?.email || t('classrooms.detail.mainTeacher.noEmail')
  const primaryTeacherAvatarUrl = primaryTeacher?.avatarUrl ?? null

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
        <AssignClassroomMemberDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          classroomId={classroom?.id ?? null}
          institutionId={classroom?.institution_id ?? null}
          members={members}
          primaryTeacherId={classroom?.primary_teacher_id ?? null}
          onAssigned={reload}
        />

        <ReassignMainTeacherDialog
          open={isReassignDialogOpen}
          onOpenChange={setIsReassignDialogOpen}
          classroomId={classroom?.id ?? null}
          institutionId={classroom?.institution_id ?? null}
          currentMainTeacherId={classroom?.primary_teacher_id ?? null}
          onReassigned={reload}
        />

        <WithdrawFromClassDialog
          open={memberToKickOut !== null}
          membershipRole={memberToKickOut?.role ?? ''}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setMemberToKickOut(null)
          }}
          onConfirmWithdraw={handleConfirmKickOut}
        />

        {breadcrumb && classroom ? (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/institution_admin/faculties">{t('faculties.title')}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/institution_admin/faculties/${breadcrumb.facultyId}/programmes`}>
                    {breadcrumb.facultyName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/institution_admin/faculties/${breadcrumb.facultyId}/programmes/${breadcrumb.programmeId}`}
                  >
                    {breadcrumb.programmeName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/institution_admin/faculties/${breadcrumb.facultyId}/programmes/${breadcrumb.programmeId}/cohorts/${breadcrumb.cohortId}`}
                  >
                    {breadcrumb.cohortName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{classroom.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}

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
                <Card variant="soft">
                  <CardHeader className="gap-1">
                    <CardTitle className="text-base font-semibold">
                      {t('classrooms.detail.mainTeacher.title')}
                    </CardTitle>
                    <Text
                      as="p"
                      variant="small"
                      color="muted"
                    >
                      {t('classrooms.detail.mainTeacher.description')}
                    </Text>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar size="default">
                        {primaryTeacherAvatarUrl ? (
                          <AvatarImage
                            src={primaryTeacherAvatarUrl}
                            alt={primaryTeacherName}
                          />
                        ) : null}
                        <AvatarFallback>{getInitial(primaryTeacherName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col gap-1">
                        <Text
                          as="p"
                          variant="body"
                          className="truncate font-medium"
                        >
                          {primaryTeacherName}
                        </Text>
                        <Text
                          as="p"
                          variant="small"
                          color="muted"
                          className="truncate"
                        >
                          {primaryTeacherEmail}
                        </Text>
                      </div>
                      <Button
                        type="button"
                        variant="darkblue"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setIsReassignDialogOpen(true)}
                      >
                        {t('classrooms.detail.mainTeacher.reassign')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

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
                    <UserRoundPlus />
                    {t('classrooms.members.assignUser')}
                  </Button>
                </div>
                <ClassroomMembersTable
                  members={tableMembers}
                  onKickOut={(member) => setMemberToKickOut(member)}
                />
              </div>
            ) : (
              <ClassroomSettings
                classroom={classroom}
                primaryTeacher={primaryTeacher}
                isSaving={isSavingSettings}
                saveError={settingsError}
                onSaveTitle={handleSaveTitle}
                onUnassignMainTeacher={handleUnassignMainTeacher}
                onReassignMainTeacher={() => setIsReassignDialogOpen(true)}
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
