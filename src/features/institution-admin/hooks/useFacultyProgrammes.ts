import { useCallback, useEffect, useState } from 'react'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import type { FacultySummary } from '../types/faculty.types'
import type { ProgrammeRecord } from '../types/programme.types'

export function useFacultyProgrammes(institutionId: string | null, facultyId: string | undefined) {
  const [faculty, setFaculty] = useState<FacultySummary | null>(null)
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)

  const reload = useCallback(() => {
    setReloadVersion((previous) => previous + 1)
  }, [])

  useEffect(() => {
    if (!institutionId || !facultyId) {
      setFaculty(null)
      setProgrammes([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const faculties = await listFacultiesByInstitution(institutionId)
        const match = faculties.find((f) => f.id === facultyId) ?? null
        if (!match) {
          if (!cancelled) {
            setFaculty(null)
            setProgrammes([])
            setError('Faculty not found')
          }
          return
        }
        const programmeRows = await listProgrammesByFaculty(facultyId)
        if (!cancelled) {
          setFaculty(match)
          setProgrammes([...programmeRows])
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [institutionId, facultyId, reloadVersion])

  return { faculty, programmes, isLoading, error, reload }
}
