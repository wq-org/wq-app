import { useEffect, useState } from 'react'
import { listFacultiesByInstitution } from '../api/facultiesApi'
import type { FacultySummary } from '../types/faculty.types'

export function useFaculties(institutionId: string | null) {
  const [faculties, setFaculties] = useState<readonly FacultySummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!institutionId) {
      setFaculties([])
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    listFacultiesByInstitution(institutionId)
      .then((rows) => {
        if (!cancelled) setFaculties(rows)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load faculties')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [institutionId])

  return { faculties, isLoading, error }
}
