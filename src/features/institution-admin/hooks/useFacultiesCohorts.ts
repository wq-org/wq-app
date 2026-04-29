import { useCallback, useEffect, useState } from 'react'
import { listCohortsByInstitution } from '../api/cohortsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByInstitution } from '../api/programmesApi'
import type { CohortRecord } from '../types/cohort.types'
import type { FacultySummary } from '../types/faculty.types'
import type { ProgrammeRecord } from '../types/programme.types'

export function useFacultiesCohorts(institutionId: string | null) {
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
      setCohorts([])
      setProgrammes([])
      setFaculties([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([
      listCohortsByInstitution(institutionId),
      listProgrammesByInstitution(institutionId),
      listFacultiesByInstitution(institutionId),
    ])
      .then(([cohortRows, programmeRows, facultyRows]) => {
        if (cancelled) return
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

  return { cohorts, programmes, faculties, isLoading, error, reload }
}
