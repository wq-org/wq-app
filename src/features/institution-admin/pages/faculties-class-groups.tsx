import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { createClassGroup, listClassGroupsByCohort } from '../api/classGroupsApi'
import { listProgrammeOfferings } from '../api/programmeOfferingsApi'
import { ClassGroupCardList } from '../components/ClassGroupCardList'
import { CreateClassGroupDialog } from '../components/CreateClassGroupDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFacultiesClassGroups } from '../hooks/useFacultiesClassGroups'
import type { CohortRecord } from '../types/cohort.types'
import type { ProgrammeRecord } from '../types/programme.types'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import {
  resolveClassGroupTitlePrefix,
  suggestNextClassGroupTitle,
} from '../utils/classGroupCreateSuggestion'
import { buildSuggestedClassGroupDescription } from '../utils/classGroupDescription'
const CLASS_GROUP_DESCRIPTION_DEBOUNCE_MS = 400

export function InstitutionFacultiesClassGroups() {
  const { t, i18n } = useTranslation('features.institution-admin')
  const { getUserInstitutionId } = useUser()
  const navigate = useNavigate()
  const institutionId = getUserInstitutionId()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createFacultyId, setCreateFacultyId] = useState('')
  const [createProgrammeId, setCreateProgrammeId] = useState('')
  const [createCohortId, setCreateCohortId] = useState('')
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [syncDescriptionWithSelection, setSyncDescriptionWithSelection] = useState(true)
  const [programmeOfferingsRows, setProgrammeOfferingsRows] = useState<
    readonly ProgrammeOfferingRecord[]
  >([])
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const {
    classGroups,
    cohorts,
    programmes,
    faculties,
    isLoading,
    error: loadError,
    reload,
  } = useFacultiesClassGroups(institutionId)

  const cohortMap = useMemo(() => {
    const map = new Map<string, CohortRecord>()
    for (const c of cohorts) map.set(c.id, c)
    return map
  }, [cohorts])

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
      classGroups.map((classGroup) => {
        const cohort = cohortMap.get(classGroup.cohort_id)
        const programme = cohort ? programmeMap.get(cohort.programme_id) : undefined
        const cohortName =
          cohort?.name?.trim() || t('faculties.pages.classGroups.card.unknownCohort')
        const programmeName =
          programme?.name?.trim() || t('faculties.pages.cohorts.card.unknownProgramme')
        const facultyName = programme
          ? facultyNameById.get(programme.faculty_id) ||
            t('faculties.pages.programmes.card.unknownFaculty')
          : t('faculties.pages.programmes.card.unknownFaculty')
        return { classGroup, cohortName, programmeName, facultyName }
      }),
    [classGroups, cohortMap, facultyNameById, programmeMap, t],
  )

  const searchableItems = useMemo(
    () =>
      items.map((row) => ({
        ...row,
        searchClassGroupName: row.classGroup.name ?? '',
        searchClassGroupDescription: row.classGroup.description ?? '',
        searchCohortName: row.cohortName,
        searchProgrammeName: row.programmeName,
        searchFacultyName: row.facultyName,
      })),
    [items],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchClassGroupName',
    'searchClassGroupDescription',
    'searchCohortName',
    'searchProgrammeName',
    'searchFacultyName',
  ]).map(({ classGroup, cohortName, facultyName, programmeName }) => ({
    classGroup,
    cohortName,
    facultyName,
    programmeName,
  }))

  const handleOpenClassGroup = (classGroupId: string) => {
    const selected = filteredItems.find((item) => item.classGroup.id === classGroupId)
    if (!selected) return
    const cohort = cohortMap.get(selected.classGroup.cohort_id)
    if (!cohort) return
    const programme = programmeMap.get(cohort.programme_id)
    if (!programme) return
    navigate(
      `/institution_admin/faculties/${encodeURIComponent(programme.faculty_id)}/programmes/${encodeURIComponent(programme.id)}/cohorts/${encodeURIComponent(cohort.id)}/class-groups/${encodeURIComponent(classGroupId)}`,
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

  const programmeIdsWithCohorts = useMemo(() => {
    const set = new Set<string>()
    for (const cohort of cohorts) {
      set.add(cohort.programme_id)
    }
    return set
  }, [cohorts])

  const programmeOptions = useMemo(() => {
    return programmes
      .filter((programme) => programme.faculty_id === createFacultyId)
      .map((programme) => ({
        id: programme.id,
        name: programme.name?.trim() || t('faculties.pages.programmes.card.untitledProgramme'),
        disabled: !programmeIdsWithCohorts.has(programme.id),
      }))
  }, [createFacultyId, programmes, programmeIdsWithCohorts, t])

  const cohortOptions = useMemo(() => {
    return cohorts
      .filter((cohort) => cohort.programme_id === createProgrammeId)
      .map((cohort) => ({
        id: cohort.id,
        name: cohort.name?.trim() || t('faculties.pages.cohorts.card.untitledCohort'),
      }))
  }, [cohorts, createProgrammeId, t])

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
      setProgrammeOfferingsRows([])
      return
    }

    let cancelled = false
    void listProgrammeOfferings(createProgrammeId)
      .then((rows) => {
        if (cancelled) return
        setProgrammeOfferingsRows(rows)
      })
      .catch(() => {
        if (!cancelled) setProgrammeOfferingsRows([])
      })

    return () => {
      cancelled = true
    }
  }, [isCreateDialogOpen, createProgrammeId])

  const titlePrefix = useMemo(() => {
    const cohort = createCohortId ? cohortMap.get(createCohortId) : undefined
    const programme = programmeMap.get(createProgrammeId)
    return resolveClassGroupTitlePrefix({
      cohort,
      programmeOfferings: programmeOfferingsRows,
      programmeName: programme?.name ?? '',
    })
  }, [createCohortId, cohortMap, createProgrammeId, programmeMap, programmeOfferingsRows])

  const suggestTitleEnabled = Boolean(createCohortId && titlePrefix)

  useEffect(() => {
    if (!isCreateDialogOpen || !syncDescriptionWithSelection) return

    const cohortYear = cohortMap.get(createCohortId)?.academic_year ?? null
    const classGroupName = createName.trim()

    const timerId = window.setTimeout(() => {
      if (
        !selectedFacultyLabel ||
        !selectedProgrammeLabel ||
        !classGroupName ||
        cohortYear == null ||
        !Number.isFinite(cohortYear)
      ) {
        setCreateDescription('')
        return
      }
      setCreateDescription(
        buildSuggestedClassGroupDescription({
          language: i18n.language,
          classGroupName,
          cohortYear,
          programmeName: selectedProgrammeLabel,
          facultyName: selectedFacultyLabel,
        }),
      )
    }, CLASS_GROUP_DESCRIPTION_DEBOUNCE_MS)

    return () => window.clearTimeout(timerId)
  }, [
    isCreateDialogOpen,
    syncDescriptionWithSelection,
    createName,
    createFacultyId,
    createProgrammeId,
    createCohortId,
    selectedFacultyLabel,
    selectedProgrammeLabel,
    i18n.language,
    cohortMap,
  ])

  const createValidationError = useMemo(() => {
    if (!createFacultyId)
      return t('faculties.pages.classGroups.createDialog.validation.facultyRequired')
    if (!createProgrammeId)
      return t('faculties.pages.classGroups.createDialog.validation.programmeRequired')
    if (!createCohortId)
      return t('faculties.pages.classGroups.createDialog.validation.cohortRequired')
    if (!createName.trim())
      return t('faculties.pages.classGroups.createDialog.validation.titleRequired')
    return null
  }, [createCohortId, createFacultyId, createName, createProgrammeId, t])

  const resetCreateForm = () => {
    setCreateFacultyId('')
    setCreateProgrammeId('')
    setCreateCohortId('')
    setCreateName('')
    setCreateDescription('')
    setSyncDescriptionWithSelection(true)
    setProgrammeOfferingsRows([])
    setIsSuggestingTitle(false)
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
    setCreateCohortId('')
  }

  const handleProgrammeChange = (programmeId: string) => {
    setCreateProgrammeId(programmeId)
    setCreateCohortId('')
  }

  const handleSuggestTitle = async () => {
    if (!createCohortId || !titlePrefix) return
    setIsSuggestingTitle(true)
    try {
      const rows = await listClassGroupsByCohort(createCohortId)
      const names = rows.map((r) => r.name)
      const typed = createName.trim()
      const existingPool = typed.length > 0 ? [...names, typed] : names

      const next = suggestNextClassGroupTitle({
        prefix: titlePrefix,
        existingNames: existingPool,
      })
      if (next) {
        setCreateName(next)
      }
    } finally {
      setIsSuggestingTitle(false)
    }
  }

  const handleCreateDescriptionChange = (value: string) => {
    setCreateDescription(value)
    setSyncDescriptionWithSelection(false)
  }

  const handleCreateClassGroup = async () => {
    if (!institutionId) {
      setCreateError(t('faculties.wizard.submit.missingInstitution'))
      return
    }
    if (createValidationError) return
    setIsSubmitting(true)
    setCreateError(null)
    try {
      await createClassGroup({
        institution_id: institutionId,
        cohort_id: createCohortId,
        name: createName.trim(),
        description: createDescription.trim() || null,
      })
      setIsCreateDialogOpen(false)
      resetCreateForm()
      reload()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create class group')
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
              {t('faculties.pages.classGroups.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('faculties.pages.classGroups.subtitle')}
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
              <Text as="span">{t('faculties.pages.classGroups.createCta')}</Text>
            </Button>
          </div>
        </div>

        <FieldInput
          label={t('faculties.pages.classGroups.searchLabel')}
          placeholder={t('faculties.pages.classGroups.searchPlaceholder')}
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
        ) : classGroups.length > 0 && filteredItems.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className="animate-in fade-in-0 slide-in-from-bottom-3"
          >
            {t('faculties.pages.classGroups.noSearchResults')}
          </Text>
        ) : filteredItems.length === 0 ? (
          <Empty className="animate-in fade-in-0 slide-in-from-bottom-3">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <LayoutGrid className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('faculties.pages.classGroups.emptyTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('faculties.pages.classGroups.emptyDescription')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="animate-in fade-in-0 slide-in-from-bottom-2">
            <ClassGroupCardList
              items={filteredItems}
              onOpenClassGroup={handleOpenClassGroup}
            />
          </div>
        )}
      </div>
      <CreateClassGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={(nextOpen) => {
          setIsCreateDialogOpen(nextOpen)
          if (!nextOpen) resetCreateForm()
        }}
        facultyOptions={facultyOptions}
        programmeOptions={programmeOptions}
        cohortOptions={cohortOptions}
        facultyId={createFacultyId}
        onFacultyIdChange={handleFacultyChange}
        programmeId={createProgrammeId}
        onProgrammeIdChange={handleProgrammeChange}
        cohortId={createCohortId}
        onCohortIdChange={setCreateCohortId}
        name={createName}
        onNameChange={setCreateName}
        description={createDescription}
        onDescriptionChange={handleCreateDescriptionChange}
        onSuggestTitle={handleSuggestTitle}
        canSuggestTitle={suggestTitleEnabled}
        isSuggestingTitle={isSuggestingTitle}
        syncDescriptionWithSelection={syncDescriptionWithSelection}
        onSyncDescriptionWithSelectionChange={setSyncDescriptionWithSelection}
        validationError={createValidationError}
        submitError={createError}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateClassGroup}
      />
    </InstitutionAdminWorkspaceShell>
  )
}
