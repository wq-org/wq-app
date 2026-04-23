import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChartNoAxesGantt, Plus, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SelectTabs } from '@/components/shared'
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

import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammeOfferings } from '../api/programmeOfferingsApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { ProgrammeOfferingCardList } from '../components/ProgrammeOfferingCardList'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import type { ProgrammeRecord } from '../types/programme.types'

const OFFERING_TABS = [
  { id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt },
  { id: 'settings', title: 'Settings', icon: Settings },
] as const

type OfferingTabId = (typeof OFFERING_TABS)[number]['id']

function toInactiveStatus(status: ProgrammeOfferingRecord['status']): 'active' | 'inactive' {
  return status === 'active' ? 'active' : 'inactive'
}

export function InstitutionProgrammeOfferings() {
  const { t } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()
  const { facultyId: facultyIdParam, programmeId: programmeIdParam } = useParams<{
    facultyId: string
    programmeId: string
  }>()

  const [activeTabId, setActiveTabId] = useState<OfferingTabId>('timeline')
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [facultyName, setFacultyName] = useState<string>('')
  const [offerings, setOfferings] = useState<readonly ProgrammeOfferingRecord[]>([])
  const [filterQuery, setFilterQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const selectedProgramme = useMemo(
    () => programmes.find((programme) => programme.id === programmeIdParam) ?? null,
    [programmes, programmeIdParam],
  )

  const tabs = useMemo(
    () =>
      OFFERING_TABS.map((tab) => ({
        ...tab,
        title: t(`faculties.pages.programmeOfferings.tabs.${tab.id}`),
      })),
    [t],
  )

  const searchableOfferings = useMemo(
    () =>
      offerings.map((offering) => ({
        offering,
        searchAcademicYear: String(offering.academic_year),
        searchTermCode: offering.term_code ?? '',
        searchStatus:
          toInactiveStatus(offering.status) === 'active'
            ? t('faculties.pages.programmeOfferings.offering.statusActive')
            : t('faculties.pages.programmeOfferings.offering.statusInactive'),
      })),
    [offerings, t],
  )

  const filteredOfferings = useSearchFilter(searchableOfferings, filterQuery, [
    'searchAcademicYear',
    'searchTermCode',
    'searchStatus',
  ]).map((row) => row.offering)

  const handleAddOffering = () => {
    // Placeholder: real add-offering flow will be wired in a follow-up.
  }

  useEffect(() => {
    if (!institutionId || !facultyIdParam || !programmeIdParam) {
      setProgrammes([])
      setOfferings([])
      setFacultyName('')
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [faculties, programmeRows, offeringRows] = await Promise.all([
          listFacultiesByInstitution(institutionId),
          listProgrammesByFaculty(facultyIdParam),
          listProgrammeOfferings(programmeIdParam),
        ])

        if (cancelled) return

        const matchedFaculty = faculties.find((faculty) => faculty.id === facultyIdParam)
        setFacultyName(matchedFaculty?.name?.trim() || t('faculties.card.untitled'))
        setProgrammes(programmeRows)
        setOfferings(offeringRows)
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : t('faculties.pages.programmeOfferings.loadError'),
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
  }, [institutionId, facultyIdParam, programmeIdParam, t])

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
    if (!selectedProgramme) {
      return (
        <Text
          as="p"
          variant="body"
          color="muted"
        >
          {t('faculties.pages.programmeOfferings.programmeNotFound')}
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
            ? t('faculties.pages.programmeOfferings.emptyFiltered')
            : t('faculties.pages.programmeOfferings.empty')}
        </Text>
      )
    }

    return <ProgrammeOfferingCardList offerings={filteredOfferings} />
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
              <BreadcrumbPage>
                {selectedProgramme?.name || t('faculties.pages.programmeOfferings.titleFallback')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Text
            as="div"
            className="flex flex-col gap-2"
          >
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
          </Text>
          <Button
            type="button"
            variant="darkblue"
            className="shrink-0 gap-2 self-start"
            onClick={handleAddOffering}
          >
            <Plus className="size-4" />
            <Text as="span">{t('faculties.pages.programmeOfferings.addOffering')}</Text>
          </Button>
        </div>

        <FieldInput
          label={t('faculties.pages.programmeOfferings.filterLabel')}
          placeholder={t('faculties.pages.programmeOfferings.filterPlaceholder')}
          value={filterQuery}
          onValueChange={setFilterQuery}
          className="w-full max-w-xl"
          disabled={isLoading}
        />

        <div className="rounded-3xl border bg-card p-5 shadow-sm ring-1 ring-black/5">
          <SelectTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onTabChange={(tabId) => setActiveTabId(tabId as OfferingTabId)}
            className="mb-5"
          />
          {activeTabId === 'timeline' ? (
            timelineContent
          ) : (
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.programmeOfferings.tabs.settingsPlaceholder')}
            </Text>
          )}
        </div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
