import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DoorOpen, LayoutGrid, Plus, Search, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { SelectTabs, showUnsavedChangesToast } from '@/components/shared'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { updateClassGroup } from '../api/classGroupsApi'
import { ClassroomCardList } from '../components/ClassroomCardList'
import { ClassGroupOfferingsTimeLine } from '../components/ClassGroupOfferingsTimeLine'
import { ClassGroupSettings } from '../components/ClassGroupSettings'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useClassGroupOfferings } from '../hooks/useClassGroupOfferings'

const OFFERING_TABS = [
  { id: 'overview', title: 'Overview', icon: LayoutGrid },
  { id: 'settings', title: 'Settings', icon: Settings },
] as const

type OfferingTabId = (typeof OFFERING_TABS)[number]['id']

const overviewContentEnter =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export function InstitutionClassGroupOfferings() {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()
  const {
    facultyId: facultyIdParam,
    programmeId: programmeIdParam,
    cohortId: cohortIdParam,
    classGroupId: classGroupIdParam,
  } = useParams<{
    facultyId: string
    programmeId: string
    cohortId: string
    classGroupId: string
  }>()
  const navigate = useNavigate()

  const [activeTabId, setActiveTabId] = useState<OfferingTabId>('overview')
  const [classroomFilterQuery, setClassroomFilterQuery] = useState('')
  const [draftClassGroupName, setDraftClassGroupName] = useState('')
  const [draftClassGroupDescription, setDraftClassGroupDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const {
    classGroups,
    offerings,
    classrooms,
    facultyName,
    programmeName,
    cohortName,
    isLoading,
    error: loadError,
    updateClassGroupInList,
  } = useClassGroupOfferings({
    institutionId,
    facultyId: facultyIdParam,
    programmeId: programmeIdParam,
    cohortId: cohortIdParam,
    classGroupId: classGroupIdParam,
  })

  const selectedClassGroup = useMemo(
    () => classGroups.find((cg) => cg.id === classGroupIdParam) ?? null,
    [classGroups, classGroupIdParam],
  )

  const tabs = useMemo(
    () =>
      OFFERING_TABS.map((tab) => ({
        ...tab,
        title: t(`faculties.pages.classGroupOfferings.tabs.${tab.id}`),
      })),
    [t],
  )

  const hasUnsavedSettingsChanges =
    selectedClassGroup !== null &&
    (draftClassGroupName !== selectedClassGroup.name ||
      draftClassGroupDescription !== (selectedClassGroup.description ?? ''))

  const classGroupDisplayName = selectedClassGroup?.name?.trim() ?? ''

  const searchableClassrooms = useMemo(
    () =>
      classrooms.map((classroom) => ({
        classroom,
        classGroupName: classGroupDisplayName,
        searchTitle: classroom.title ?? '',
        searchGroup: classGroupDisplayName,
        searchStatus:
          classroom.status === 'active'
            ? t('classrooms.card.statusActive')
            : t('classrooms.card.statusInactive'),
      })),
    [classGroupDisplayName, classrooms, t],
  )

  const filteredClassroomItems = useSearchFilter(searchableClassrooms, classroomFilterQuery, [
    'searchTitle',
    'searchGroup',
    'searchStatus',
  ]).map(({ classroom, classGroupName }) => ({ classroom, classGroupName }))

  const showClassroomsSection =
    activeTabId === 'overview' &&
    Boolean(classGroupIdParam) &&
    !loadError &&
    (isLoading || selectedClassGroup)

  const handleAddOffering = () => {
    // Placeholder: add-offering flow wired in a follow-up.
  }

  const handleOpenClassroom = (classroomId: string) => {
    navigate(`/institution_admin/classrooms/${encodeURIComponent(classroomId)}`)
  }

  const handleSaveClassGroupSettings = async () => {
    if (!selectedClassGroup) return
    setIsSaving(true)
    try {
      const updated = await updateClassGroup({
        classGroupId: selectedClassGroup.id,
        name: draftClassGroupName,
        description: draftClassGroupDescription.trim() || null,
      })
      updateClassGroupInList(updated)
      toast.success(t('faculties.pages.classGroupOfferings.settings.saveSuccess'))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('faculties.pages.classGroupOfferings.settings.saveError'),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleTopTabChange = (nextTabId: string) => {
    const resolvedTab = nextTabId as OfferingTabId
    if (resolvedTab === activeTabId) return

    if (activeTabId === 'settings' && hasUnsavedSettingsChanges) {
      showUnsavedChangesToast({
        t: (key) => t(`faculties.pages.classGroupOfferings.${key}`),
        onStay: () => {},
        onContinue: () => setActiveTabId(resolvedTab),
      })
      return
    }

    setActiveTabId(resolvedTab)
  }

  useEffect(() => {
    if (!selectedClassGroup) {
      setDraftClassGroupName('')
      setDraftClassGroupDescription('')
      return
    }
    setDraftClassGroupName(selectedClassGroup.name)
    setDraftClassGroupDescription(selectedClassGroup.description ?? '')
  }, [selectedClassGroup])

  const timelineContent = (() => {
    if (isLoading) {
      return (
        <div className="flex min-h-40 items-center justify-center">
          <Spinner
            variant="gray"
            size="sm"
            speed={1750}
          />
        </div>
      )
    }
    if (loadError) {
      return (
        <Text
          as="p"
          variant="small"
          color="danger"
        >
          {loadError}
        </Text>
      )
    }
    if (!selectedClassGroup) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('faculties.pages.classGroupOfferings.classGroupNotFound')}
        </Text>
      )
    }
    if (offerings.length === 0) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('faculties.pages.classGroupOfferings.empty')}
        </Text>
      )
    }

    return <ClassGroupOfferingsTimeLine offerings={offerings} />
  })()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4 animate-in fade-in-0 slide-in-from-bottom-4">
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
                <Link to={`/institution_admin/faculties/${facultyIdParam}/programmes`}>
                  {facultyName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to={`/institution_admin/faculties/${facultyIdParam}/programmes/${programmeIdParam}`}
                >
                  {programmeName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to={`/institution_admin/faculties/${facultyIdParam}/programmes/${programmeIdParam}/cohorts/${cohortIdParam}`}
                >
                  {cohortName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {selectedClassGroup?.name || t('faculties.pages.classGroupOfferings.titleFallback')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <SelectTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabChange={handleTopTabChange}
          className="mb-1"
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {selectedClassGroup?.name || t('faculties.pages.classGroupOfferings.titleFallback')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.classGroupOfferings.subtitle')}
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="darkblue"
              className="gap-2"
              onClick={handleAddOffering}
            >
              <Plus className="size-4" />
              <Text as="span">{t('faculties.pages.classGroupOfferings.addOffering')}</Text>
            </Button>
          </div>
        </div>

        {activeTabId === 'overview' ? (
          <>
            <div className={overviewContentEnter}>{timelineContent}</div>
            {showClassroomsSection ? (
              <div className={`flex flex-col gap-4 ${overviewContentEnter}`}>
                <Separator />
                <FieldInput
                  label={t('classrooms.searchLabel')}
                  placeholder={t('classrooms.searchPlaceholder')}
                  value={classroomFilterQuery}
                  onValueChange={setClassroomFilterQuery}
                  className="w-full max-w-xl"
                  disabled={isLoading}
                />
                {isLoading ? (
                  <div className="flex min-h-24 items-center justify-center">
                    <Spinner
                      variant="gray"
                      size="sm"
                      speed={1750}
                    />
                  </div>
                ) : filteredClassroomItems.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        {classroomFilterQuery.trim() ? (
                          <Search className="size-6" />
                        ) : (
                          <DoorOpen className="size-6" />
                        )}
                      </EmptyMedia>
                      <EmptyTitle>
                        {t('faculties.pages.classGroupOfferings.classroomsSection.title')}
                      </EmptyTitle>
                      <EmptyDescription>
                        {classroomFilterQuery.trim()
                          ? t('classrooms.noSearchResults')
                          : t('faculties.pages.classGroupOfferings.classroomsSection.empty')}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ClassroomCardList
                    items={filteredClassroomItems}
                    onOpenClassroom={handleOpenClassroom}
                  />
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border bg-card p-5 shadow-sm ring-1 ring-black/5">
            <ClassGroupSettings
              isLoading={isLoading}
              isSaving={isSaving}
              loadError={loadError}
              selectedClassGroup={selectedClassGroup}
              draftClassGroupName={draftClassGroupName}
              draftClassGroupDescription={draftClassGroupDescription}
              hasUnsavedSettingsChanges={hasUnsavedSettingsChanges}
              onClassGroupNameChange={setDraftClassGroupName}
              onClassGroupDescriptionChange={setDraftClassGroupDescription}
              onSaveChanges={handleSaveClassGroupSettings}
            />
          </div>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
