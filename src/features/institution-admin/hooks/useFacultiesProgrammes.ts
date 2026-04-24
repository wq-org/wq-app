import { useEffect, useState } from 'react'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByInstitution } from '../api/programmesApi'
import type { ProgrammeRecord } from '../types/programme.types'

export function useFacultiesProgrammes(institutionId: string | null) {
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [facultyNames, setFacultyNames] = useState<ReadonlyMap<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!institutionId) {
      setProgrammes([])
      setFacultyNames(new Map())
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([
      listFacultiesByInstitution(institutionId),
      listProgrammesByInstitution(institutionId),
    ])
      .then(([facultyRows, programmeRows]) => {
        if (cancelled) return
        const map = new Map<string, string>()
        for (const f of facultyRows) map.set(f.id, f.name?.trim() || f.id)
        setFacultyNames(map)
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

  return { programmes, facultyNames, isLoading, error }
}
