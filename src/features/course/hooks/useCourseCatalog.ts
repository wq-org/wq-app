import { useCallback, useEffect, useState } from 'react'

import { listCourseCatalog } from '../api/coursesApi'
import type { CourseCatalogItem } from '../types/course.types'

type UseCourseCatalogOptions = {
  institutionId?: string | null
  enabled?: boolean
}

type UseCourseCatalogResult = {
  courses: CourseCatalogItem[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useCourseCatalog({
  institutionId,
  enabled = true,
}: UseCourseCatalogOptions = {}): UseCourseCatalogResult {
  const [courses, setCourses] = useState<CourseCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(enabled && institutionId !== null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || institutionId === null) {
      setCourses([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const rows = await listCourseCatalog({
        institutionId: institutionId ?? undefined,
      })
      setCourses(rows)
    } catch (e) {
      setCourses([])
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, institutionId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { courses, isLoading, error, refresh }
}
