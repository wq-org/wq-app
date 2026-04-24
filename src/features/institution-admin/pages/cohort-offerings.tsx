import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LayoutGrid, Plus, Settings } from 'lucide-react'
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
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { listCohortsByProgramme, updateCohort } from '../api/cohortsApi'
import { listCohortOfferings } from '../api/cohortOfferingsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import { CohortOfferingTable } from '../components/CohortOfferingTable'
import { CohortSettings } from '../components/CohortSettings'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type { CohortRecord } from '../types/cohort.types'

const OFFERING_TABS = [
  { id: 'overview', title: 'Overview', icon: LayoutGrid },
  { id: 'settings', title: 'Settings', icon: Settings },
] as const

type OfferingTabId = (typeof OFFERING_TABS)[number]['id']

export function InstitutionCohortOfferings() {
  const { t } = useTranslation('features.institution-admin')
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
  const [cohorts, setCohorts] = useState<readonly CohortRecord[]>([])
  const [offerings, setOfferings] = useState<readonly CohortOfferingRecord[]>([])
  const [facultyName, setFacultyName] = useState<string>('')
  const [programmeName, setProgrammeName] = useState<string>('')
  const [filterQuery, setFilterQuery] = useState('')
  const [draftCohortName, setDraftCohortName] = useState('')
  const [draftCohortDescription, setDraftCohortDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

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

  const searchableOfferings = useMemo(
    () =>
      offerings.map((offering) => ({
        offering,
        searchStatus:
          offering.status === 'active'
            ? t('faculties.pages.cohortOfferings.offering.statusActive')
            : t('faculties.pages.cohortOfferings.offering.statusInactive'),
        searchStartsAt: offering.starts_at ?? '',
        searchEndsAt: offering.ends_at ?? '',
      })),
    [offerings, t],
  )

  const filteredOfferings = useSearchFilter(searchableOfferings, filterQuery, [
    'searchStatus',
    'searchStartsAt',
    'searchEndsAt',
  ]).map((row) => row.offering)

  const handleAddOffering = () => {
    // Placeholder: add-offering flow wired in a follow-up.
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
      setCohorts((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
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
    if (!institutionId || !facultyIdParam || !programmeIdParam || !cohortIdParam) {
      setCohorts([])
      setOfferings([])
      setFacultyName('')
      setProgrammeName('')
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [faculties, programmeRows, cohortRows, offeringRows] = await Promise.all([
          listFacultiesByInstitution(institutionId),
          listProgrammesByFaculty(facultyIdParam),
          listCohortsByProgramme(programmeIdParam),
          listCohortOfferings(cohortIdParam),
        ])

        if (cancelled) return

        const matchedFaculty = faculties.find((f) => f.id === facultyIdParam)
        setFacultyName(matchedFaculty?.name?.trim() || t('faculties.card.untitled'))

        const matchedProgramme = programmeRows.find((p) => p.id === programmeIdParam)
        setProgrammeName(
          matchedProgramme?.name?.trim() || t('faculties.pages.cohortOfferings.programmeFallback'),
        )

        setCohorts(cohortRows)
        setOfferings(offeringRows)
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : t('faculties.pages.cohortOfferings.loadError'),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [institutionId, facultyIdParam, programmeIdParam, cohortIdParam, t])

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
    if (filteredOfferings.length === 0) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {filterQuery.trim()
            ? t('faculties.pages.cohortOfferings.emptyFiltered')
            : t('faculties.pages.cohortOfferings.empty')}
        </Text>
      )
    }

    return (
      <CohortOfferingTable
        offerings={filteredOfferings}
        institutionId={institutionId ?? ''}
      />
    )
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
            <FieldInput
              label={t('faculties.pages.cohortOfferings.filterLabel')}
              placeholder={t('faculties.pages.cohortOfferings.filterPlaceholder')}
              value={filterQuery}
              onValueChange={setFilterQuery}
              className="w-full max-w-xl"
              disabled={isLoading}
            />
            <div className="rounded-3xl border bg-card p-5 shadow-sm ring-1 ring-black/5">
              {timelineContent}
            </div>
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
    </InstitutionAdminWorkspaceShell>
  )
}
