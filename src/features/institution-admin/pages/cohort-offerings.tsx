import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LayoutGrid, Plus, Search, Settings } from 'lucide-react'
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

import { updateCohort } from '../api/cohortsApi'
import { ClassGroupCardList } from '../components/ClassGroupCardList'
import { CohortOfferingsTimeLine } from '../components/CohortOfferingsTimeLine'
import { CohortSettings } from '../components/CohortSettings'
import { CreateCohortOfferingDialog } from '../components/CreateCohortOfferingDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useCohortOfferings } from '../hooks/useCohortOfferings'

const OFFERING_TABS = [
  { id: 'overview', title: 'Overview', icon: LayoutGrid },
  { id: 'settings', title: 'Settings', icon: Settings },
] as const

type OfferingTabId = (typeof OFFERING_TABS)[number]['id']

const overviewContentEnter =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export function InstitutionCohortOfferings() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()
  const {
    facultyId: facultyIdParam,
    programmeId: programmeIdParam,
    cohortId: cohortIdParam,
  } = useParams<{
    facultyId: string
    programmeId: string
    cohortId: string
  }>()

  const [activeTabId, setActiveTabId] = useState<OfferingTabId>('overview')
  const [classGroupFilterQuery, setClassGroupFilterQuery] = useState('')
  const [draftCohortName, setDraftCohortName] = useState('')
  const [draftCohortDescription, setDraftCohortDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [createOfferingOpen, setCreateOfferingOpen] = useState(false)

  const {
    cohorts,
    offerings,
    classGroups,
    facultyName,
    programmeName,
    isLoading,
    error: loadError,
    updateCohortInList,
    appendOffering,
  } = useCohortOfferings({
    institutionId,
    facultyId: facultyIdParam,
    programmeId: programmeIdParam,
    cohortId: cohortIdParam,
  })

  const selectedCohort = useMemo(
    () => cohorts.find((c) => c.id === cohortIdParam) ?? null,
    [cohorts, cohortIdParam],
  )

  const tabs = useMemo(
    () =>
      OFFERING_TABS.map((tab) => ({
        ...tab,
        title: t(`faculties.pages.cohortOfferings.tabs.${tab.id}`),
      })),
    [t],
  )

  const hasUnsavedSettingsChanges =
    selectedCohort !== null &&
    (draftCohortName !== selectedCohort.name ||
      draftCohortDescription !== (selectedCohort.description ?? ''))

  const cohortDisplayName = selectedCohort?.name?.trim() ?? ''

  const searchableClassGroups = useMemo(
    () =>
      classGroups.map((classGroup) => ({
        classGroup,
        searchName: classGroup.name ?? '',
        searchDescription: classGroup.description ?? '',
        searchCohortName: cohortDisplayName,
      })),
    [classGroups, cohortDisplayName],
  )

  const filteredClassGroups = useSearchFilter(searchableClassGroups, classGroupFilterQuery, [
    'searchName',
    'searchDescription',
    'searchCohortName',
  ]).map((row) => row.classGroup)

  const classGroupCardItems = useMemo(() => {
    const cohortName = selectedCohort?.name?.trim() ?? ''
    return filteredClassGroups.map((classGroup) => ({ classGroup, cohortName }))
  }, [filteredClassGroups, selectedCohort?.name])

  const handleOpenClassGroup = (classGroupId: string) => {
    if (!facultyIdParam || !programmeIdParam || !cohortIdParam) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(facultyIdParam)}/programmes/${encodeURIComponent(programmeIdParam)}/cohorts/${encodeURIComponent(cohortIdParam)}/class-groups/${encodeURIComponent(classGroupId)}`,
    )
  }

  const handleAddOffering = () => {
    if (!institutionId || !programmeIdParam || !cohortIdParam) return
    setCreateOfferingOpen(true)
  }

  const handleSaveCohortSettings = async () => {
    if (!selectedCohort) return
    setIsSaving(true)
    try {
      const updated = await updateCohort({
        cohortId: selectedCohort.id,
        name: draftCohortName,
        description: draftCohortDescription.trim() || null,
      })
      updateCohortInList(updated)
      toast.success(t('faculties.pages.cohortOfferings.settings.saveSuccess'))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('faculties.pages.cohortOfferings.settings.saveError'),
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
        t: (key) => t(`faculties.pages.cohortOfferings.${key}`),
        onStay: () => {},
        onContinue: () => setActiveTabId(resolvedTab),
      })
      return
    }

    setActiveTabId(resolvedTab)
  }

  useEffect(() => {
    if (!selectedCohort) {
      setDraftCohortName('')
      setDraftCohortDescription('')
      return
    }
    setDraftCohortName(selectedCohort.name)
    setDraftCohortDescription(selectedCohort.description ?? '')
  }, [selectedCohort])

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
    if (!selectedCohort) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('faculties.pages.cohortOfferings.cohortNotFound')}
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
          {t('faculties.pages.cohortOfferings.empty')}
        </Text>
      )
    }

    return <CohortOfferingsTimeLine offerings={offerings} />
  })()

  const showClassGroupsSection =
    activeTabId === 'overview' &&
    Boolean(cohortIdParam) &&
    !loadError &&
    (isLoading || selectedCohort)

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
              <BreadcrumbPage>
                {selectedCohort?.name || t('faculties.pages.cohortOfferings.titleFallback')}
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
              {selectedCohort?.name || t('faculties.pages.cohortOfferings.titleFallback')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.cohortOfferings.subtitle')}
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
              <Text as="span">{t('faculties.pages.cohortOfferings.addOffering')}</Text>
            </Button>
          </div>
        </div>

        {activeTabId === 'overview' ? (
          <>
            <div className={overviewContentEnter}>{timelineContent}</div>
            {showClassGroupsSection ? (
              <div className={`flex flex-col gap-4 ${overviewContentEnter}`}>
                <Separator />
                <FieldInput
                  label={t('faculties.pages.classGroups.searchLabel')}
                  placeholder={t('faculties.pages.classGroups.searchPlaceholder')}
                  value={classGroupFilterQuery}
                  onValueChange={setClassGroupFilterQuery}
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
                ) : filteredClassGroups.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        {classGroupFilterQuery.trim() ? (
                          <Search className="size-6" />
                        ) : (
                          <LayoutGrid className="size-6" />
                        )}
                      </EmptyMedia>
                      <EmptyTitle>
                        {t('faculties.pages.cohortOfferings.classGroupsSection.title')}
                      </EmptyTitle>
                      <EmptyDescription>
                        {classGroupFilterQuery.trim()
                          ? t('faculties.pages.classGroups.noSearchResults')
                          : t('faculties.pages.cohortOfferings.classGroupsSection.empty')}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ClassGroupCardList
                    items={classGroupCardItems}
                    onOpenClassGroup={handleOpenClassGroup}
                  />
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border bg-card p-5 shadow-sm ring-1 ring-black/5">
            <CohortSettings
              isLoading={isLoading}
              isSaving={isSaving}
              loadError={loadError}
              selectedCohort={selectedCohort}
              draftCohortName={draftCohortName}
              draftCohortDescription={draftCohortDescription}
              hasUnsavedSettingsChanges={hasUnsavedSettingsChanges}
              onCohortNameChange={setDraftCohortName}
              onCohortDescriptionChange={setDraftCohortDescription}
              onSaveChanges={handleSaveCohortSettings}
            />
          </div>
        )}
      </div>
      {programmeIdParam && cohortIdParam ? (
        <CreateCohortOfferingDialog
          open={createOfferingOpen}
          onOpenChange={setCreateOfferingOpen}
          institutionId={institutionId}
          programmeId={programmeIdParam}
          cohortId={cohortIdParam}
          onCreated={appendOffering}
        />
      ) : null}
    </InstitutionAdminWorkspaceShell>
  )
}
