import { useCallback } from 'react'

import { getLessonById } from '../api/lessonsApi'

/**
 * Returns a stable `prefetchLesson(lessonId)` callback that warms the lesson
 * editor's cold path before navigation:
 *
 * - the lesson header + draft content row
 *
 * Designed to be wired to `onMouseEnter` / `onFocus` of links and buttons that
 * open a lesson. Fire-and-forget; errors are swallowed because the real fetch
 * on navigation will surface them.
 */
export function useLessonPrefetch() {
  return useCallback((lessonId: string | undefined) => {
    if (!lessonId) return
    void getLessonById(lessonId).catch(() => undefined)
  }, [])
}
