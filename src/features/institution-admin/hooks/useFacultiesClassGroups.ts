import { useEffect, useState } from 'react'
import { listClassGroupsByInstitution } from '../api/classGroupsApi'
import { listCohortsByInstitution } from '../api/cohortsApi'
import { listProgrammesByInstitution } from '../api/programmesApi'
import type { ClassGroupRecord } from '../types/class-group.types'
import type { CohortRecord } from '../types/cohort.types'
import type { ProgrammeRecord } from '../types/programme.types'

export function useFacultiesClassGroups(institutionId: string | null) {
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [cohorts, setCohorts] = useState<readonly CohortRecord[]>([])
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!institutionId) {
      setClassGroups([])
      setCohorts([])
      setProgrammes([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([
      listClassGroupsByInstitution(institutionId),
      listCohortsByInstitution(institutionId),
      listProgrammesByInstitution(institutionId),
    ])
      .then(([classGroupRows, cohortRows, programmeRows]) => {
        if (cancelled) return
        setClassGroups(classGroupRows)
        setCohorts(cohortRows)
        setProgrammes(programmeRows)
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
  }, [institutionId])

  return { classGroups, cohorts, programmes, isLoading, error }
}
