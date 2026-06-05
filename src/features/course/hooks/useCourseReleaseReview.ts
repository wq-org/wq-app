import { useCallback, useEffect, useMemo, useState } from 'react'

import type { CourseDraftDiffFile } from '../types/course-release.types'
import { useCourseReleaseStatus } from './useCourseReleaseStatus'

type UseCourseReleaseReviewParams = {
  courseId: string | undefined
  initialFocusLessonId?: string | undefined
}

export function useCourseReleaseReview({
  courseId,
  initialFocusLessonId,
}: UseCourseReleaseReviewParams) {
  const releaseStatus = useCourseReleaseStatus({ courseId })
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const files = useMemo(() => releaseStatus.diff?.files ?? [], [releaseStatus.diff])

  const selectedFile = useMemo((): CourseDraftDiffFile | null => {
    if (files.length === 0) return null
    if (selectedItemId) {
      return files.find((file) => file.id === selectedItemId) ?? files[0] ?? null
    }
    return files[0] ?? null
  }, [files, selectedItemId])

  useEffect(() => {
    if (!initialFocusLessonId?.trim() || files.length === 0) return

    const focusId = initialFocusLessonId.trim()
    const match =
      files.find((file) => file.id === `lesson-content-${focusId}`) ??
      files.find((file) => file.id === `lesson-metadata-${focusId}`) ??
      files.find((file) => file.id === `lesson-added-${focusId}`)

    if (match) {
      setSelectedItemId(match.id)
    }
  }, [files, initialFocusLessonId])

  const selectItem = useCallback((itemId: string) => {
    setSelectedItemId(itemId)
  }, [])

  return {
    ...releaseStatus,
    files,
    selectedItemId: selectedFile?.id ?? null,
    selectedFile,
    selectItem,
  }
}
