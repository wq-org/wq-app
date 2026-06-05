import { useCallback, useEffect, useState } from 'react'

import { listPublishedCourseVersions } from '../api/courseVersionApi'
import type { PublishedCourseVersionSummary } from '../types/course-version.types'

export function usePublishedCourseVersionsList(courseId: string | undefined) {
  const [versions, setVersions] = useState<PublishedCourseVersionSummary[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(courseId?.trim()))
  const [error, setError] = useState<string | null>(null)

  const loadVersions = useCallback(async () => {
    const trimmedCourseId = courseId?.trim()
    if (!trimmedCourseId) {
      setVersions([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const rows = await listPublishedCourseVersions(trimmedCourseId)
      setVersions(rows)
    } catch (err: unknown) {
      setVersions([])
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    void loadVersions()
  }, [loadVersions])

  return { versions, isLoading, error, reload: loadVersions }
}
