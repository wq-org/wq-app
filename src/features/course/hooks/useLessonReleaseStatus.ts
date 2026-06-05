import { useMemo } from 'react'

import { compareDraftToPublished, resolveLessonReleaseStatus } from '../utils/courseRelease.utils'
import { useCourseReleaseStatus } from './useCourseReleaseStatus'

type UseLessonReleaseStatusParams = {
  courseId: string | undefined
  lessonId: string | undefined
  enabled?: boolean
}

export function useLessonReleaseStatus({
  courseId,
  lessonId,
  enabled = true,
}: UseLessonReleaseStatusParams) {
  const { draft, live, loading, error, refetch } = useCourseReleaseStatus({
    courseId,
    enabled: enabled && Boolean(lessonId?.trim()),
  })

  const diff = useMemo(() => {
    if (!draft) return null
    return compareDraftToPublished({ draft, live })
  }, [draft, live])

  const status = useMemo(() => {
    if (!diff || !lessonId?.trim()) {
      return {
        isInLiveSnapshot: false,
        liveVersionNo: live?.versionNo ?? null,
        hasDraftDrift: false,
        diffFileId: null as string | null,
      }
    }
    return resolveLessonReleaseStatus(diff, live, lessonId.trim())
  }, [diff, live, lessonId])

  return {
    live,
    diff,
    status,
    loading,
    error,
    refetch,
  }
}
