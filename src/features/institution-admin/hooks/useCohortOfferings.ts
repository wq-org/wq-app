import { useCallback, useEffect, useState } from 'react'
import { listClassGroupsByCohort } from '../api/classGroupsApi'
import { listCohortsByProgramme } from '../api/cohortsApi'
import { listCohortOfferings } from '../api/cohortOfferingsApi'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import { listProgrammeOfferings } from '../api/programmeOfferingsApi'
import { listProgrammesByFaculty } from '../api/programmesApi'
import type { ClassGroupRecord } from '../types/class-group.types'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type { CohortRecord } from '../types/cohort.types'

type Params = {
  institutionId: string | null
  facultyId: string | undefined
  programmeId: string | undefined
  cohortId: string | undefined
}

export function useCohortOfferings({ institutionId, facultyId, programmeId, cohortId }: Params) {
  const [cohorts, setCohorts] = useState<readonly CohortRecord[]>([])
  const [offerings, setOfferings] = useState<readonly CohortOfferingRecord[]>([])
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [facultyName, setFacultyName] = useState<string>('')
  const [programmeName, setProgrammeName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!institutionId || !facultyId || !programmeId || !cohortId) {
      setCohorts([])
      setOfferings([])
      setClassGroups([])
      setFacultyName('')
      setProgrammeName('')
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [
          faculties,
          programmeRows,
          cohortRows,
          offeringRows,
          programmeOfferingRows,
          classGroupRows,
        ] = await Promise.all([
          listFacultiesByInstitution(institutionId),
          listProgrammesByFaculty(facultyId),
          listCohortsByProgramme(programmeId),
          listCohortOfferings(cohortId),
          listProgrammeOfferings(programmeId),
          listClassGroupsByCohort(cohortId),
        ])
        if (cancelled) return
        const matchedFaculty = faculties.find((f) => f.id === facultyId)
        setFacultyName(matchedFaculty?.name?.trim() || '')
        const matchedProgramme = programmeRows.find((p) => p.id === programmeId)
        setProgrammeName(matchedProgramme?.name?.trim() || '')
        setCohorts(cohortRows)
        const programmeOfferingById = new Map(
          programmeOfferingRows.map((po) => [
            po.id,
            { academic_year: po.academic_year, term_code: po.term_code },
          ]),
        )
        setOfferings(
          offeringRows.map((row) => ({
            ...row,
            programme_offering: programmeOfferingById.get(row.programme_offering_id) ?? null,
          })),
        )
        setClassGroups(classGroupRows)
      } catch (e) {
        if (!cancelled) {
          setClassGroups([])
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
  }, [institutionId, facultyId, programmeId, cohortId])

  const updateCohortInList = useCallback((updated: CohortRecord) => {
    setCohorts((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
  }, [])

  return {
    cohorts,
    offerings,
    classGroups,
    facultyName,
    programmeName,
    isLoading,
    error,
    updateCohortInList,
  }
}
