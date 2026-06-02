import { useCallback, useEffect, useState } from 'react'
import { listClassGroupsByInstitution } from '../api/classGroupsApi'
import { listCohortsByInstitution } from '../api/cohortsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByInstitution } from '../api/programmesApi'
import type { ClassGroupRecord } from '../types/class-group.types'
import type { CohortRecord } from '../types/cohort.types'
import type { FacultySummary } from '../types/faculty.types'
import type { ProgrammeRecord } from '../types/programme.types'

export function useFacultiesClassGroups(institutionId: string | null) {
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [cohorts, setCohorts] = useState<readonly CohortRecord[]>([])
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [faculties, setFaculties] = useState<readonly FacultySummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const reload = useCallback(() => {
    setReloadToken((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!institutionId) {
      setClassGroups([])
      setCohorts([])
      setProgrammes([])
      setFaculties([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([
      listClassGroupsByInstitution(institutionId),
      listCohortsByInstitution(institutionId),
      listProgrammesByInstitution(institutionId),
      listFacultiesByInstitution(institutionId),
    ])
      .then(([classGroupRows, cohortRows, programmeRows, facultyRows]) => {
        if (cancelled) return
        setClassGroups(classGroupRows)
        setCohorts(cohortRows)
        setProgrammes(programmeRows)
        setFaculties(facultyRows)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [institutionId, reloadToken])

  return { classGroups, cohorts, programmes, faculties, isLoading, error, reload }
}
