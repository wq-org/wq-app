import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LayoutGrid, Plus, Search, Settings, Users } from 'lucide-react'
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

import { archiveProgrammeOffering } from '../api/programmeOfferingsApi'
import { archiveProgramme, updateProgramme } from '../api/programmesApi'
import { CohortCardList } from '../components/CohortCardList'
import { CreateProgrammeOfferingDialog } from '../components/CreateProgrammeOfferingDialog'
import { EditProgrammeOfferingsDraftDialog } from '../components/EditProgrammeOfferingsDraftDialog'
import { EditProgrammeOfferingDialog } from '../components/EditProgrammeOfferingDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { ProgrammeOfferingsTimeline } from '../components/ProgrammeOfferingsTimeline'
import { ProgrammeSettings } from '../components/ProgrammeSettings'
import { useProgrammeOfferings } from '../hooks/useProgrammeOfferings'

const OFFERING_TABS = [
  { id: 'overview', title: 'Overview', icon: LayoutGrid },
  { id: 'settings', title: 'Settings', icon: Settings },
] as const

/** Matches `faculty-programmes` overview + `ProgrammeSettings` motion-safe duration. */
const overviewContentEnter =
  'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

type OfferingTabId = (typeof OFFERING_TABS)[number]['id']

export function InstitutionProgrammeOfferings() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()
  const { facultyId: facultyIdParam, programmeId: programmeIdParam } = useParams<{
    facultyId: string
    programmeId: string
  }>()

  const [activeTabId, setActiveTabId] = useState<OfferingTabId>('overview')
  const [cohortFilterQuery, setCohortFilterQuery] = useState('')
  const [draftProgrammeName, setDraftProgrammeName] = useState('')
  const [draftProgrammeDescription, setDraftProgrammeDescription] = useState('')
  const [draftProgrammeDurationYears, setDraftProgrammeDurationYears] = useState(3)
  const [isSaving, setIsSaving] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [createOfferingOpen, setCreateOfferingOpen] = useState(false)
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(null)

  const {
    programmes,
    facultyName,
    offerings,
    cohorts,
    isLoading,
    error: loadError,
    updateProgrammeInList,
    appendOffering,
    replaceOffering,
  } = useProgrammeOfferings({
    institutionId,
    facultyId: facultyIdParam,
    programmeId: programmeIdParam,
  })

  const selectedProgramme = useMemo(
    () => programmes.find((programme) => programme.id === programmeIdParam) ?? null,
    [programmes, programmeIdParam],
  )
  const editingOffering = useMemo(
    () => offerings.find((offering) => offering.id === editingOfferingId) ?? null,
    [offerings, editingOfferingId],
  )
  const editingDraftOffering = editingOffering?.status === 'draft' ? editingOffering : null
  const editingActiveOffering = editingOffering?.status === 'active' ? editingOffering : null

  const tabs = useMemo(
    () =>
      OFFERING_TABS.map((tab) => ({
        ...tab,
        title: t(`faculties.pages.programmeOfferings.tabs.${tab.id}`),
      })),
    [t],
  )

  const hasUnsavedSettingsChanges =
    selectedProgramme !== null &&
    (draftProgrammeName !== selectedProgramme.name ||
      draftProgrammeDescription !== (selectedProgramme.description ?? '') ||
      draftProgrammeDurationYears !== (selectedProgramme.duration_years ?? 3))

  const searchableCohorts = useMemo(
    () =>
      cohorts.map((cohort) => ({
        cohort,
        searchName: cohort.name ?? '',
        searchDescription: cohort.description ?? '',
        searchAcademicYear: cohort.academic_year != null ? String(cohort.academic_year) : '',
      })),
    [cohorts],
  )

  const filteredCohorts = useSearchFilter(searchableCohorts, cohortFilterQuery, [
    'searchName',
    'searchDescription',
    'searchAcademicYear',
  ]).map((row) => row.cohort)

  const cohortCardItems = useMemo(() => {
    const programmeName = selectedProgramme?.name?.trim() ?? ''
    const facultyNameTrimmed = facultyName?.trim() ?? ''
    return filteredCohorts.map((cohort) => ({
      cohort,
      programmeName,
      facultyName: facultyNameTrimmed,
    }))
  }, [filteredCohorts, selectedProgramme?.name, facultyName])

  const handleOpenCohort = (cohortId: string) => {
    if (!facultyIdParam || !programmeIdParam) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(facultyIdParam)}/programmes/${encodeURIComponent(programmeIdParam)}/cohorts/${encodeURIComponent(cohortId)}`,
    )
  }

  const handleAddOffering = () => {
    if (!institutionId || !programmeIdParam) return
    setCreateOfferingOpen(true)
  }

  const handleEditOffering = (offeringId: string) => {
    setEditingOfferingId(offeringId)
  }

  const handleArchiveOffering = async (offeringId: string) => {
    try {
      const archived = await archiveProgrammeOffering(offeringId)
      replaceOffering(archived)
      toast.success('Offering archived')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive offering')
    }
  }

  const handleSaveProgrammeSettings = async () => {
    if (!selectedProgramme) return
    setIsSaving(true)
    try {
      const updatedProgramme = await updateProgramme({
        programmeId: selectedProgramme.id,
        name: draftProgrammeName,
        description: draftProgrammeDescription.trim() || null,
        duration_years: draftProgrammeDurationYears,
      })
      updateProgrammeInList(updatedProgramme)
      toast.success(t('faculties.pages.programmeOfferings.settings.saveSuccess'))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('faculties.pages.programmeOfferings.settings.saveError'),
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleArchiveProgramme = async () => {
    if (!selectedProgramme || selectedProgramme.deleted_at) return
    setIsArchiving(true)
    try {
      const archived = await archiveProgramme(selectedProgramme.id)
      updateProgrammeInList(archived)
      toast.success(t('faculties.pages.programmeOfferings.settings.archiveSuccess'))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('faculties.pages.programmeOfferings.settings.archiveError'),
      )
    } finally {
      setIsArchiving(false)
    }
  }

  const handleTopTabChange = (nextTabId: string) => {
    const resolvedTab = nextTabId as OfferingTabId
    if (resolvedTab === activeTabId) return

    if (activeTabId === 'settings' && hasUnsavedSettingsChanges) {
      showUnsavedChangesToast({
        t: (key) => t(`faculties.pages.programmeOfferings.${key}`),
        onStay: () => {},
        onContinue: () => setActiveTabId(resolvedTab),
      })
      return
    }

    setActiveTabId(resolvedTab)
  }

  useEffect(() => {
    if (!selectedProgramme) {
      setDraftProgrammeName('')
      setDraftProgrammeDescription('')
      return
    }

    setDraftProgrammeName(selectedProgramme.name)
    setDraftProgrammeDescription(selectedProgramme.description ?? '')
    setDraftProgrammeDurationYears(selectedProgramme.duration_years ?? 3)
  }, [selectedProgramme])

  const showCohortsSection =
    activeTabId === 'overview' &&
    Boolean(programmeIdParam) &&
    !loadError &&
    (isLoading || selectedProgramme)

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
              <BreadcrumbPage>
                {selectedProgramme?.name || t('faculties.pages.programmeOfferings.titleFallback')}
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
              {selectedProgramme?.name || t('faculties.pages.programmeOfferings.titleFallback')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.programmeOfferings.subtitle')}
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
              <Text as="span">{t('faculties.pages.programmeOfferings.addOffering')}</Text>
            </Button>
          </div>
        </div>

        {activeTabId === 'overview' ? (
          <>
            <div className={overviewContentEnter}>
              <ProgrammeOfferingsTimeline
                offerings={offerings}
                isLoading={isLoading}
                loadError={loadError}
                isProgrammeMissing={!selectedProgramme}
                isFilteredEmpty={offerings.length === 0}
                t={t}
                onEditOffering={handleEditOffering}
                onArchiveOffering={handleArchiveOffering}
              />
            </div>
            {showCohortsSection ? (
              <div className={`flex flex-col gap-4 ${overviewContentEnter}`}>
                <Separator />
                <FieldInput
                  label={t('faculties.pages.cohorts.searchLabel')}
                  placeholder={t('faculties.pages.cohorts.searchPlaceholder')}
                  value={cohortFilterQuery}
                  onValueChange={setCohortFilterQuery}
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
                ) : filteredCohorts.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        {cohortFilterQuery.trim() ? (
                          <Search className="size-6" />
                        ) : (
                          <Users className="size-6" />
                        )}
                      </EmptyMedia>
                      <EmptyTitle>
                        {t('faculties.pages.programmeOfferings.cohortsSection.title')}
                      </EmptyTitle>
                      <EmptyDescription>
                        {cohortFilterQuery.trim()
                          ? t('faculties.pages.cohorts.noSearchResults')
                          : t('faculties.pages.programmeOfferings.cohortsSection.empty')}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <CohortCardList
                    items={cohortCardItems}
                    onOpenCohort={handleOpenCohort}
                  />
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-3xl border bg-card p-5 shadow-sm ring-1 ring-black/5">
            <ProgrammeSettings
              isLoading={isLoading}
              isSaving={isSaving}
              loadError={loadError}
              selectedProgramme={selectedProgramme}
              draftProgrammeName={draftProgrammeName}
              draftProgrammeDescription={draftProgrammeDescription}
              draftProgrammeDurationYears={draftProgrammeDurationYears}
              hasUnsavedSettingsChanges={hasUnsavedSettingsChanges}
              onProgrammeNameChange={setDraftProgrammeName}
              onProgrammeDescriptionChange={setDraftProgrammeDescription}
              onProgrammeDurationYearsChange={setDraftProgrammeDurationYears}
              onSaveChanges={handleSaveProgrammeSettings}
              onArchiveProgramme={handleArchiveProgramme}
              isArchiving={isArchiving}
            />
          </div>
        )}
      </div>
      {programmeIdParam ? (
        <>
          <CreateProgrammeOfferingDialog
            open={createOfferingOpen}
            onOpenChange={setCreateOfferingOpen}
            institutionId={institutionId}
            programmeId={programmeIdParam}
            programmeName={selectedProgramme?.name ?? ''}
            programmeDurationYears={selectedProgramme?.duration_years ?? null}
            onCreated={appendOffering}
          />
          <EditProgrammeOfferingDialog
            open={editingActiveOffering !== null}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setEditingOfferingId(null)
            }}
            offering={editingActiveOffering}
            onUpdated={replaceOffering}
          />
          <EditProgrammeOfferingsDraftDialog
            open={editingDraftOffering !== null}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) setEditingOfferingId(null)
            }}
            offering={editingDraftOffering}
            onUpdated={replaceOffering}
          />
        </>
      ) : null}
    </InstitutionAdminWorkspaceShell>
  )
}
