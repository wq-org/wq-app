import { useEffect, useMemo, useState } from 'react'
import { DoorOpen, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FieldInput } from '@/components/ui/field-input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { useSearchFilter } from '@/hooks/useSearchFilter'

import { listClassGroupsByInstitution } from '../api/classGroupsApi'
import { listClassroomsByInstitution } from '../api/classroomsApi'
import { listCohortsByInstitution } from '../api/cohortsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByInstitution } from '../api/programmesApi'
import { ClassroomCardList } from '../components/ClassroomCardList'
import { CreateClassroomDialog } from '../components/CreateClassroomDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import type { ClassGroupRecord } from '../types/class-group.types'
import type { ClassroomRecord } from '../types/classroom.types'
import type { CohortRecord } from '../types/cohort.types'
import type { FacultySummary } from '../types/faculty.types'
import type { ProgrammeRecord } from '../types/programme.types'

const contentEnter = 'animate-in fade-in-0 slide-in-from-bottom-2 motion-safe:duration-300' as const

export function InstitutionClassrooms() {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { getUserInstitutionId } = useUser()
  const institutionId = getUserInstitutionId()

  const [classrooms, setClassrooms] = useState<readonly ClassroomRecord[]>([])
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [cohorts, setCohorts] = useState<readonly CohortRecord[]>([])
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [faculties, setFaculties] = useState<readonly FacultySummary[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const classGroupById = useMemo(() => {
    const map = new Map<string, ClassGroupRecord>()
    for (const row of classGroups) map.set(row.id, row)
    return map
  }, [classGroups])

  const cohortById = useMemo(() => {
    const map = new Map<string, CohortRecord>()
    for (const c of cohorts) map.set(c.id, c)
    return map
  }, [cohorts])

  const programmeById = useMemo(() => {
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

  const hierarchyForClassGroup = useMemo(() => {
    const resolve = (classGroupId: string) => {
      const cg = classGroupById.get(classGroupId)
      const cohort = cg ? cohortById.get(cg.cohort_id) : undefined
      const programme = cohort ? programmeById.get(cohort.programme_id) : undefined
      const classGroupName = cg?.name?.trim() || t('classrooms.card.unknownClassGroup')
      const cohortName = cohort?.name?.trim() || t('faculties.pages.classGroups.card.unknownCohort')
      const programmeName =
        programme?.name?.trim() || t('faculties.pages.cohorts.card.unknownProgramme')
      const facultyName = programme
        ? facultyNameById.get(programme.faculty_id) ||
          t('faculties.pages.programmes.card.unknownFaculty')
        : t('faculties.pages.programmes.card.unknownFaculty')
      return { classGroupName, cohortName, programmeName, facultyName }
    }
    return resolve
  }, [classGroupById, cohortById, facultyNameById, programmeById, t])

  const searchableItems = useMemo(
    () =>
      classrooms.map((classroom) => {
        const { classGroupName, cohortName, programmeName, facultyName } = hierarchyForClassGroup(
          classroom.class_group_id,
        )
        const statusLabel =
          classroom.status === 'active'
            ? t('classrooms.card.statusActive')
            : t('classrooms.card.statusInactive')
        return {
          classroom,
          classGroupName,
          facultyName,
          programmeName,
          cohortName,
          searchTitle: classroom.title ?? '',
          searchGroup: classGroupName,
          searchFacultyName: facultyName,
          searchProgrammeName: programmeName,
          searchCohortName: cohortName,
          searchStatus: statusLabel,
        }
      }),
    [classrooms, hierarchyForClassGroup, t],
  )

  const filteredItems = useSearchFilter(searchableItems, searchQuery, [
    'searchTitle',
    'searchGroup',
    'searchFacultyName',
    'searchProgrammeName',
    'searchCohortName',
    'searchStatus',
  ]).map(({ classroom, classGroupName, facultyName, programmeName, cohortName }) => ({
    classroom,
    classGroupName,
    facultyName,
    programmeName,
    cohortName,
  }))

  const handleAddClassroom = () => {
    setIsCreateDialogOpen(true)
  }

  const handleClassroomCreated = (createdClassroom: ClassroomRecord) => {
    setClassrooms((previous) =>
      [...previous, createdClassroom].sort((a, b) => a.title.localeCompare(b.title)),
    )
  }

  const handleOpenClassroom = (classroomId: string) => {
    navigate(`/institution_admin/classrooms/${classroomId}`)
  }

  useEffect(() => {
    if (!institutionId) {
      setClassrooms([])
      setClassGroups([])
      setCohorts([])
      setProgrammes([])
      setFaculties([])
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const [classroomRows, classGroupRows, cohortRows, programmeRows, facultyRows] =
          await Promise.all([
            listClassroomsByInstitution(institutionId),
            listClassGroupsByInstitution(institutionId),
            listCohortsByInstitution(institutionId),
            listProgrammesByInstitution(institutionId),
            listFacultiesByInstitution(institutionId),
          ])

        if (cancelled) return

        setClassrooms(classroomRows)
        setClassGroups(classGroupRows)
        setCohorts(cohortRows)
        setProgrammes(programmeRows)
        setFaculties(facultyRows)
      } catch (error) {
        if (!cancelled) {
          setClassrooms([])
          setClassGroups([])
          setCohorts([])
          setProgrammes([])
          setFaculties([])
          setLoadError(error instanceof Error ? error.message : t('classrooms.loadError'))
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
  }, [institutionId, t])

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-2 pb-12 pt-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <CreateClassroomDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          institutionId={institutionId}
          onCreated={handleClassroomCreated}
        />
        <div className="animate-in fade-in-0 slide-in-from-bottom-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-bold"
            >
              {t('classrooms.title')}
            </Text>
            <Text
              as="p"
              variant="body"
              color="muted"
            >
              {t('classrooms.subtitle')}
            </Text>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="darkblue"
              className="gap-2"
              onClick={handleAddClassroom}
            >
              <Plus className="size-4" />
              <Text as="span">{t('classrooms.addClassroom')}</Text>
            </Button>
          </div>
        </div>

        <FieldInput
          label={t('classrooms.searchLabel')}
          placeholder={t('classrooms.searchPlaceholder')}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className={`max-w-xl ${contentEnter}`}
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
            className={contentEnter}
          >
            {loadError}
          </Text>
        ) : classrooms.length > 0 && filteredItems.length === 0 ? (
          <Text
            as="p"
            variant="body"
            color="muted"
            className={contentEnter}
          >
            {t('classrooms.noSearchResults')}
          </Text>
        ) : filteredItems.length === 0 ? (
          <Empty className={contentEnter}>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <DoorOpen className="size-6" />
              </EmptyMedia>
              <EmptyTitle>{t('classrooms.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('classrooms.emptyDescription')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className={contentEnter}>
            <ClassroomCardList
              items={filteredItems}
              onOpenClassroom={handleOpenClassroom}
            />
          </div>
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}
