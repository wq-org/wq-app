import { useCallback, useEffect, useState } from 'react'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammeOfferings } from '../api/programmeOfferingsApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import { listCohortsByProgramme } from '../api/cohortsApi'
import type { CohortRecord } from '../types/cohort.types'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import type { ProgrammeRecord } from '../types/programme.types'

type Params = {
  institutionId: string | null
  facultyId: string | undefined
  programmeId: string | undefined
}

export function useProgrammeOfferings({ institutionId, facultyId, programmeId }: Params) {
  const [programmes, setProgrammes] = useState<readonly ProgrammeRecord[]>([])
  const [facultyName, setFacultyName] = useState<string>('')
  const [offerings, setOfferings] = useState<readonly ProgrammeOfferingRecord[]>([])
  const [cohorts, setCohorts] = useState<readonly CohortRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!institutionId || !facultyId || !programmeId) {
      setProgrammes([])
      setOfferings([])
      setCohorts([])
      setFacultyName('')
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [faculties, programmeRows, offeringRows, cohortRows] = await Promise.all([
          listFacultiesByInstitution(institutionId),
          listProgrammesByFaculty(facultyId),
          listProgrammeOfferings(programmeId),
          listCohortsByProgramme(programmeId),
        ])
        if (cancelled) return
        const matchedFaculty = faculties.find((f) => f.id === facultyId)
        setFacultyName(matchedFaculty?.name?.trim() || '')
        setProgrammes(programmeRows)
        setOfferings(offeringRows)
        setCohorts(cohortRows)
      } catch (e) {
        if (!cancelled) {
          setCohorts([])
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
  }, [institutionId, facultyId, programmeId])

  const updateProgrammeInList = useCallback((updated: ProgrammeRecord) => {
    setProgrammes((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
  }, [])

  return { programmes, facultyName, offerings, cohorts, isLoading, error, updateProgrammeInList }
}
