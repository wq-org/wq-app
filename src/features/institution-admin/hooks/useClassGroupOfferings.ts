import { useCallback, useEffect, useState } from 'react'
import { listClassGroupsByCohort } from '../api/classGroupsApi'
import { listClassGroupOfferings } from '../api/classGroupOfferingsApi'
import { listClassroomsByClassGroup } from '../api/classroomsApi'
import { listCohortsByProgramme } from '../api/cohortsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import type { ClassGroupRecord } from '../types/class-group.types'
import type { ClassroomRecord } from '../types/classroom.types'

type Params = {
  institutionId: string | null
  facultyId: string | undefined
  programmeId: string | undefined
  cohortId: string | undefined
  classGroupId: string | undefined
}

export function useClassGroupOfferings({
  institutionId,
  facultyId,
  programmeId,
  cohortId,
  classGroupId,
}: Params) {
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [offerings, setOfferings] = useState<readonly ClassGroupOfferingRecord[]>([])
  const [classrooms, setClassrooms] = useState<readonly ClassroomRecord[]>([])
  const [facultyName, setFacultyName] = useState<string>('')
  const [programmeName, setProgrammeName] = useState<string>('')
  const [cohortName, setCohortName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!institutionId || !facultyId || !programmeId || !cohortId || !classGroupId) {
      setClassGroups([])
      setOfferings([])
      setClassrooms([])
      setFacultyName('')
      setProgrammeName('')
      setCohortName('')
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [faculties, programmeRows, cohortRows, classGroupRows, offeringRows, classroomRows] =
          await Promise.all([
            listFacultiesByInstitution(institutionId),
            listProgrammesByFaculty(facultyId),
            listCohortsByProgramme(programmeId),
            listClassGroupsByCohort(cohortId),
            listClassGroupOfferings(classGroupId),
            listClassroomsByClassGroup(classGroupId),
          ])
        if (cancelled) return
        setFacultyName(faculties.find((f) => f.id === facultyId)?.name?.trim() || '')
        setProgrammeName(programmeRows.find((p) => p.id === programmeId)?.name?.trim() || '')
        setCohortName(cohortRows.find((c) => c.id === cohortId)?.name?.trim() || '')
        setClassGroups(classGroupRows)
        setOfferings(offeringRows)
        setClassrooms(classroomRows)
      } catch (e) {
        if (!cancelled) {
          setClassrooms([])
          setError(e instanceof Error ? e.message : 'Failed to load')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [institutionId, facultyId, programmeId, cohortId, classGroupId])

  const updateClassGroupInList = useCallback((updated: ClassGroupRecord) => {
    setClassGroups((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
  }, [])

  return {
    classGroups,
    offerings,
    classrooms,
    facultyName,
    programmeName,
    cohortName,
    isLoading,
    error,
    updateClassGroupInList,
  }
}
