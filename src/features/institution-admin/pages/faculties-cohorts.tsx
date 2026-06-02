import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { createCohort } from '../api/cohortsApi'
import { listProgrammeOfferings } from '../api/programmeOfferingsApi'
import { CohortCardList } from '../components/CohortCardList'
import { CreateCohortDialog } from '../components/CreateCohortDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFacultiesCohorts } from '../hooks/useFacultiesCohorts'
import type { ProgrammeRecord } from '../types/programme.types'
import {
  computeNextAcademicYearForProgramme,
  suggestCohortShortTitle,
} from '../utils/cohortCreateSuggestion'
import { buildSuggestedCohortDescription } from '../utils/cohortDescription'
import { clampAcademicYear } from '../utils/termCode'

const COHORT_DESCRIPTION_DEBOUNCE_MS = 400

export function InstitutionFacultiesCohorts() {
  const { t, i18n } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const institutionId = getUserInstitutionId()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFacultyId, setCreateFacultyId] = useState('')
  const [createProgrammeId, setCreateProgrammeId] = useState('')
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createAcademicYear, setCreateAcademicYear] = useState<number>(() =>
    clampAcademicYear(new Date().getFullYear()),
  )
  const [syncTitleWithProgramme, setSyncTitleWithProgramme] = useState(true)
  const [descriptiveTitle, setDescriptiveTitle] = useState(false)
  const [syncDescriptionWithProgramme, setSyncDescriptionWithProgramme] = useState(true)
  const [offeringTermCodes, setOfferingTermCodes] = useState<readonly string[]>([])
  const cohortProgrammeDefaultsRef = useRef<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const {
    cohorts,
    programmes,
    faculties,
    isLoading,
    error: loadError,
    reload,
  } = useFacultiesCohorts(institutionId)

  const programmeMap = useMemo(() => {
    const map = new Map<string, ProgrammeRecord>()
    for (const p of programmes) map.set(p.id, p)
    return map
  }, [programmes])

  const facultyNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const f of faculties) {
      map.set(f.id, f.name?.trim() || t('faculties.card.untitled'))
    }
    return map
  }, [faculties, t])

  const items = useMemo(
    () =>
      cohorts.map((cohort) => {
        const programme = programmeMap.get(cohort.programme_id)
        const programmeName =
          programme?.name?.trim() || t('faculties.pages.cohorts.card.unknownProgramme')
        const facultyName = programme
          ? facultyNameById.get(programme.faculty_id) ||
            t('faculties.pages.programmes.card.unknownFaculty')
          : t('faculties.pages.programmes.card.unknownFaculty')
        return { cohort, programmeName, facultyName }
      }),
    [cohorts, facultyNameById, programmeMap, t],
  )

  const searchableItems = useMemo(
    () =>
      items.map((row) => ({
        ...row,
        searchCohortName: row.cohort.name ?? '',
        searchCohortDescription: row.cohort.description ?? '',
        searchProgrammeName: row.programmeName,
        searchFacultyName: row.facultyName,
      })),
    [items],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchCohortName',
    'searchCohortDescription',
    'searchProgrammeName',
    'searchFacultyName',
  ]).map(({ cohort, programmeName, facultyName }) => ({ cohort, programmeName, facultyName }))

  const handleOpenCohort = (cohortId: string) => {
    const selected = filteredItems.find((item) => item.cohort.id === cohortId)
    if (!selected) return
    const programme = programmeMap.get(selected.cohort.programme_id)
    if (!programme) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(programme.faculty_id)}/programmes/${encodeURIComponent(programme.id)}/cohorts/${encodeURIComponent(cohortId)}`,
    )
  }

  const facultyOptions = useMemo(() => {
    const facultyIdsWithProgrammes = new Set(programmes.map((programme) => programme.faculty_id))
    return faculties.map((faculty) => ({
      id: faculty.id,
      name: faculty.name?.trim() || t('faculties.card.untitled'),
      disabled: !facultyIdsWithProgrammes.has(faculty.id),
    }))
  }, [faculties, programmes, t])

  const programmeOptions = useMemo(() => {
    return programmes
      .filter((programme) => programme.faculty_id === createFacultyId)
      .map((programme) => ({
        id: programme.id,
        name: programme.name?.trim() || t('faculties.pages.programmes.card.untitledProgramme'),
      }))
  }, [createFacultyId, programmes, t])

  const selectedFacultyLabel = useMemo(() => {
    const row = faculties.find((f) => f.id === createFacultyId)
    return row?.name?.trim() ?? ''
  }, [faculties, createFacultyId])

  const selectedProgrammeLabel = useMemo(() => {
    const p = programmeMap.get(createProgrammeId)
    return p?.name?.trim() ?? ''
  }, [programmeMap, createProgrammeId])

  useEffect(() => {
    if (!isCreateDialogOpen || !createProgrammeId) {
      setOfferingTermCodes([])
      return
    }
    setOfferingTermCodes([])
    let cancelled = false
    void listProgrammeOfferings(createProgrammeId)
      .then((rows) => {
        if (cancelled) return
        setOfferingTermCodes(
          rows.map((r) => r.term_code ?? '').filter((code) => code.trim().length > 0),
        )
      })
      .catch(() => {
        if (!cancelled) setOfferingTermCodes([])
      })
    return () => {
      cancelled = true
    }
  }, [isCreateDialogOpen, createProgrammeId])

  useEffect(() => {
    if (!isCreateDialogOpen) {
      cohortProgrammeDefaultsRef.current = null
      return
    }
    if (!createProgrammeId) {
      cohortProgrammeDefaultsRef.current = null
      return
    }
    if (cohortProgrammeDefaultsRef.current === createProgrammeId) return
    cohortProgrammeDefaultsRef.current = createProgrammeId

    const programme = programmeMap.get(createProgrammeId)
    if (!programme) return

    const years = cohorts
      .filter((c) => c.programme_id === createProgrammeId)
      .map((c) => c.academic_year)
      .filter((y): y is number => y != null && Number.isFinite(y))
    const nextY = computeNextAcademicYearForProgramme(
      years,
      clampAcademicYear(new Date().getFullYear()),
    )
    setCreateAcademicYear(nextY)
    setSyncTitleWithProgramme(true)
  }, [isCreateDialogOpen, createProgrammeId, cohorts, programmeMap])

  useEffect(() => {
    if (!isCreateDialogOpen || !createProgrammeId || !syncTitleWithProgramme) return
    const programme = programmeMap.get(createProgrammeId)
    if (!programme) return

    setCreateName(
      suggestCohortShortTitle({
        programmeName: programme.name ?? '',
        academicYear: createAcademicYear,
        offeringTermCodes,
        descriptive: descriptiveTitle,
      }),
    )
  }, [
    isCreateDialogOpen,
    createProgrammeId,
    createAcademicYear,
    offeringTermCodes,
    syncTitleWithProgramme,
    descriptiveTitle,
    programmeMap,
  ])

  useEffect(() => {
    if (!isCreateDialogOpen || !syncDescriptionWithProgramme) return

    const cohortName = createName.trim()
    const timerId = window.setTimeout(() => {
      if (!selectedFacultyLabel || !selectedProgrammeLabel || !cohortName) {
        setCreateDescription('')
        return
      }
      setCreateDescription(
        buildSuggestedCohortDescription({
          language: i18n.language,
          cohortName,
          programmeName: selectedProgrammeLabel,
          facultyName: selectedFacultyLabel,
        }),
      )
    }, COHORT_DESCRIPTION_DEBOUNCE_MS)

    return () => window.clearTimeout(timerId)
  }, [
    isCreateDialogOpen,
    syncDescriptionWithProgramme,
    createName,
    selectedFacultyLabel,
    selectedProgrammeLabel,
    i18n.language,
  ])

  const createValidationError = useMemo(() => {
    if (!createFacultyId)
      return t('faculties.pages.cohorts.createDialog.validation.facultyRequired')
    if (!createProgrammeId)
      return t('faculties.pages.cohorts.createDialog.validation.programmeRequired')
    if (!createName.trim())
      return t('faculties.pages.cohorts.createDialog.validation.titleRequired')
    if (!Number.isInteger(createAcademicYear)) {
      return t('faculties.pages.cohorts.createDialog.validation.academicYearInvalid')
    }
    return null
  }, [createAcademicYear, createFacultyId, createName, createProgrammeId, t])

  const resetCreateForm = () => {
    setCreateFacultyId('')
    setCreateProgrammeId('')
    setCreateName('')
    setCreateDescription('')
    setCreateAcademicYear(clampAcademicYear(new Date().getFullYear()))
    setSyncTitleWithProgramme(true)
    setDescriptiveTitle(false)
    setSyncDescriptionWithProgramme(true)
    setOfferingTermCodes([])
    cohortProgrammeDefaultsRef.current = null
    setCreateError(null)
    setIsSubmitting(false)
  }

  const handleCreateStructure = () => {
    setIsCreateDialogOpen(true)
    setCreateError(null)
  }

  const handleFacultyChange = (facultyId: string) => {
    setCreateFacultyId(facultyId)
    setCreateProgrammeId('')
    cohortProgrammeDefaultsRef.current = null
  }

  const handleCreateNameChange = (value: string) => {
    setCreateName(value)
    setSyncTitleWithProgramme(false)
  }

  const handleProgrammeIdChange = (programmeId: string) => {
    setCreateProgrammeId(programmeId)
  }

  const handleCreateDescriptionChange = (value: string) => {
    setCreateDescription(value)
    setSyncDescriptionWithProgramme(false)
  }

  const handleCreateCohort = async () => {
    if (!institutionId) {
      setCreateError(t('faculties.wizard.submit.missingInstitution'))
      return
    }
    if (createValidationError) return
    setIsSubmitting(true)
    setCreateError(null)
    try {
      await createCohort({
        institution_id: institutionId,
        programme_id: createProgrammeId,
        name: createName.trim(),
        description: createDescription.trim() || null,
        academic_year: createAcademicYear,
      })
      setIsCreateDialogOpen(false)
      resetCreateForm()
      reload()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create cohort')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="animate-in fade-in-0 slide-in-from-bottom-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {t('faculties.pages.cohorts.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.cohorts.subtitle')}
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="darkblue"
              className="gap-2"
              onClick={handleCreateStructure}
            >
              <Plus className="size-4" />
              <Text as="span">{t('faculties.pages.cohorts.createCta')}</Text>
            </Button>
          </div>
        </div>

        <FieldInput
          label={t('faculties.pages.cohorts.searchLabel')}
          placeholder={t('faculties.pages.cohorts.searchPlaceholder')}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="max-w-xl animate-in fade-in-0 slide-in-from-bottom-2"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center animate-in fade-in-0 slide-in-from-bottom-2">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : loadError ? (
          <Text
            as="p"
            variant="small"
            color="danger"
            className="animate-in fade-in-0 slide-in-from-bottom-2"
          >
            {loadError}
          </Text>
        ) : cohorts.length > 0 && filteredItems.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className="animate-in fade-in-0 slide-in-from-bottom-3"
          >
            {t('faculties.pages.cohorts.noSearchResults')}
          </Text>
        ) : filteredItems.length === 0 ? (
          <Empty className="animate-in fade-in-0 slide-in-from-bottom-3">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('faculties.pages.cohorts.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('faculties.pages.cohorts.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="animate-in fade-in-0 slide-in-from-bottom-2">
            <CohortCardList
              items={filteredItems}
              onOpenCohort={handleOpenCohort}
            />
          </div>
        )}
      </div>
      <CreateCohortDialog
        open={isCreateDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsCreateDialogOpen(nextOpen)
          if (!nextOpen) resetCreateForm()
        }}
        facultyOptions={facultyOptions}
        programmeOptions={programmeOptions}
        facultyId={createFacultyId}
        onFacultyIdChange={handleFacultyChange}
        programmeId={createProgrammeId}
        onProgrammeIdChange={handleProgrammeIdChange}
        academicYear={createAcademicYear}
        onAcademicYearChange={setCreateAcademicYear}
        name={createName}
        onNameChange={handleCreateNameChange}
        description={createDescription}
        onDescriptionChange={handleCreateDescriptionChange}
        syncTitleWithProgramme={syncTitleWithProgramme}
        onSyncTitleWithProgrammeChange={setSyncTitleWithProgramme}
        descriptiveTitle={descriptiveTitle}
        onDescriptiveTitleChange={setDescriptiveTitle}
        syncDescriptionWithProgramme={syncDescriptionWithProgramme}
        onSyncDescriptionWithProgrammeChange={setSyncDescriptionWithProgramme}
        validationError={createValidationError}
        submitError={createError}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateCohort}
      />
    </InstitutionAdminWorkspaceShell>
  )
}
