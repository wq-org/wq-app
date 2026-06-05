import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchCourseDraftSnapshot, fetchLatestPublishedCourseTree } from '../api/courseReleaseApi'
import type { CourseDraftDiff, CourseDraftSnapshot } from '../types/course-release.types'
import type { PublishedCourseVersion } from '../types/course-version.types'
import { compareDraftToPublished } from '../utils/courseRelease.utils'

type UseCourseReleaseStatusParams = {
  courseId: string | undefined
  enabled?: boolean
}

type CourseReleaseStatusState = {
  draft: CourseDraftSnapshot | null
  live: PublishedCourseVersion | null
  diff: CourseDraftDiff | null
  deliveryCount: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCourseReleaseStatus({
  courseId,
  enabled = true,
}: UseCourseReleaseStatusParams): CourseReleaseStatusState {
  const [draft, setDraft] = useState<CourseDraftSnapshot | null>(null)
  const [live, setLive] = useState<PublishedCourseVersion | null>(null)
  const [deliveryCount, setDeliveryCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const trimmedCourseId = courseId?.trim()
    if (!trimmedCourseId || !enabled) {
      setDraft(null)
      setLive(null)
      setDeliveryCount(0)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [nextDraft, published] = await Promise.all([
        fetchCourseDraftSnapshot(trimmedCourseId),
        fetchLatestPublishedCourseTree(trimmedCourseId),
      ])

      setDraft(nextDraft)
      setLive(published.tree)
      setDeliveryCount(published.deliveryCount)
    } catch (err: unknown) {
      setDraft(null)
      setLive(null)
      setDeliveryCount(0)
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setLoading(false)
    }
  }, [courseId, enabled])

  useEffect(() => {
    void load()
  }, [load])

  const diff = useMemo(() => {
    if (!draft) return null
    return compareDraftToPublished({ draft, live })
  }, [draft, live])

  return {
    draft,
    live,
    diff,
    deliveryCount,
    loading,
    error,
    refetch: load,
  }
}
