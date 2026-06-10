import { useCallback } from 'react'

import { useUser } from '@/contexts/user'

import { getTeacherLessonById } from '../api/lessonsApi'

/**
 * Returns a stable `prefetchLesson(lessonId)` callback that warms the lesson
 * editor's cold path before navigation:
 *
 * - the lesson header + draft content row
 *
 * Designed to be wired to `onMouseEnter` / `onFocus` of links and buttons that
 * open a lesson. Fire-and-forget; errors are swallowed because the real fetch
 * on navigation will surface them.
 *
 * Students read published lesson snapshots via course versions — skip teacher RPCs.
 */
export function useLessonPrefetch() {
  const { getRole } = useUser()

  return useCallback(
    (lessonId: string | undefined) => {
      if (!lessonId || getRole() === 'student') return
      void getTeacherLessonById(lessonId).catch(() => undefined)
    },
    [getRole],
  )
}
