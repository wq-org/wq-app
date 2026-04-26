import { useMemo, useState } from 'react'
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

import { createClassGroup } from '../api/classGroupsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { ClassGroupCardList } from '../components/ClassGroupCardList'
import { CreateClassGroupDialog } from '../components/CreateClassGroupDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useFacultiesClassGroups } from '../hooks/useFacultiesClassGroups'
import type { CohortRecord } from '../types/cohort.types'
import type { FacultySummary } from '../types/faculty.types'
import type { ProgrammeRecord } from '../types/programme.types'

export function InstitutionFacultiesClassGroups() {
  const { t } = useTranslation('features.institution-admin')
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [faculties, setFaculties] = useState<readonly FacultySummary[]>([])

  const {
    classGroups,
    cohorts,
    programmes,
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

  const items = useMemo(
    () =>
      classGroups.map((classGroup) => ({
        classGroup,
        cohortName:
          cohortMap.get(classGroup.cohort_id)?.name?.trim() ||
          t('faculties.pages.classGroups.card.unknownCohort'),
      })),
    [classGroups, cohortMap, t],
  )

  const searchableItems = useMemo(
    () =>
      items.map((row) => ({
        ...row,
        searchClassGroupName: row.classGroup.name ?? '',
        searchClassGroupDescription: row.classGroup.description ?? '',
        searchCohortName: row.cohortName,
      })),
    [items],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchClassGroupName',
    'searchClassGroupDescription',
    'searchCohortName',
  ]).map(({ classGroup, cohortName }) => ({ classGroup, cohortName }))

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
    return faculties.map((faculty) => ({
      id: faculty.id,
      name: faculty.name?.trim() || t('faculties.card.untitled'),
    }))
  }, [faculties, t])

  const programmeOptions = useMemo(() => {
    return programmes
      .filter((programme) => programme.faculty_id === createFacultyId)
      .map((programme) => ({
        id: programme.id,
        name: programme.name?.trim() || t('faculties.pages.programmes.card.untitledProgramme'),
      }))
  }, [createFacultyId, programmes, t])

  const cohortOptions = useMemo(() => {
    return cohorts
      .filter((cohort) => cohort.programme_id === createProgrammeId)
      .map((cohort) => ({
        id: cohort.id,
        name: cohort.name?.trim() || t('faculties.pages.cohorts.card.untitledCohort'),
      }))
  }, [cohorts, createProgrammeId, t])

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
    setCreateError(null)
    setIsSubmitting(false)
  }

  const handleCreateStructure = async () => {
    setIsCreateDialogOpen(true)
    setCreateError(null)
    if (!institutionId) return
    try {
      const rows = await listFacultiesByInstitution(institutionId)
      setFaculties(rows)
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to load faculties')
    }
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
        onDescriptionChange={setCreateDescription}
        validationError={createValidationError}
        submitError={createError}
        isSubmitting={isSubmitting}
        onSubmit={handleCreateClassGroup}
      />
    </InstitutionAdminWorkspaceShell>
  )
}
