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

import { listClassGroupsByCohort, updateClassGroup } from '../api/classGroupsApi'
import { listClassGroupOfferings } from '../api/classGroupOfferingsApi'
import { listCohortsByProgramme } from '../api/cohortsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import { ClassGroupOfferingTable } from '../components/ClassGroupOfferingTable'
import { ClassGroupSettings } from '../components/ClassGroupSettings'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import type { ClassGroupRecord } from '../types/class-group.types'

const OFFERING_TABS = [
  { id: 'overview', title: 'Overview', icon: LayoutGrid },
  { id: 'settings', title: 'Settings', icon: Settings },
] as const

type OfferingTabId = (typeof OFFERING_TABS)[number]['id']

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

  const [activeTabId, setActiveTabId] = useState<OfferingTabId>('overview')
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [offerings, setOfferings] = useState<readonly ClassGroupOfferingRecord[]>([])
  const [facultyName, setFacultyName] = useState<string>('')
  const [programmeName, setProgrammeName] = useState<string>('')
  const [cohortName, setCohortName] = useState<string>('')
  const [filterQuery, setFilterQuery] = useState('')
  const [draftClassGroupName, setDraftClassGroupName] = useState('')
  const [draftClassGroupDescription, setDraftClassGroupDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

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

  const searchableOfferings = useMemo(
    () =>
      offerings.map((offering) => ({
        offering,
        searchStatus:
          offering.status === 'active'
            ? t('faculties.pages.classGroupOfferings.offering.statusActive')
            : t('faculties.pages.classGroupOfferings.offering.statusInactive'),
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

  const handleSaveClassGroupSettings = async () => {
    if (!selectedClassGroup) return
    setIsSaving(true)
    try {
      const updated = await updateClassGroup({
        classGroupId: selectedClassGroup.id,
        name: draftClassGroupName,
        description: draftClassGroupDescription.trim() || null,
      })
      setClassGroups((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
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
    if (
      !institutionId ||
      !facultyIdParam ||
      !programmeIdParam ||
      !cohortIdParam ||
      !classGroupIdParam
    ) {
      setClassGroups([])
      setOfferings([])
      setFacultyName('')
      setProgrammeName('')
      setCohortName('')
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [faculties, programmeRows, cohortRows, classGroupRows, offeringRows] =
          await Promise.all([
            listFacultiesByInstitution(institutionId),
            listProgrammesByFaculty(facultyIdParam),
            listCohortsByProgramme(programmeIdParam),
            listClassGroupsByCohort(cohortIdParam),
            listClassGroupOfferings(classGroupIdParam),
          ])

        if (cancelled) return

        const matchedFaculty = faculties.find((f) => f.id === facultyIdParam)
        setFacultyName(matchedFaculty?.name?.trim() || t('faculties.card.untitled'))

        const matchedProgramme = programmeRows.find((p) => p.id === programmeIdParam)
        setProgrammeName(
          matchedProgramme?.name?.trim() ||
            t('faculties.pages.classGroupOfferings.programmeFallback'),
        )

        const matchedCohort = cohortRows.find((c) => c.id === cohortIdParam)
        setCohortName(
          matchedCohort?.name?.trim() || t('faculties.pages.classGroupOfferings.cohortFallback'),
        )

        setClassGroups(classGroupRows)
        setOfferings(offeringRows)
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : t('faculties.pages.classGroupOfferings.loadError'),
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
  }, [institutionId, facultyIdParam, programmeIdParam, cohortIdParam, classGroupIdParam, t])

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
    if (filteredOfferings.length === 0) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {filterQuery.trim()
            ? t('faculties.pages.classGroupOfferings.emptyFiltered')
            : t('faculties.pages.classGroupOfferings.empty')}
        </Text>
      )
    }

    return <ClassGroupOfferingTable offerings={filteredOfferings} />
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
            <FieldInput
              label={t('faculties.pages.classGroupOfferings.filterLabel')}
              placeholder={t('faculties.pages.classGroupOfferings.filterPlaceholder')}
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
