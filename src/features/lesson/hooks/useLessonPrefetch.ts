import { useCallback } from 'react'

import {
  fetchLessonBlockTypeRegistry,
  prefetchLessonBlocksHead,
} from '../api/lessonBlocksApi'

/**
 * Returns a stable `prefetchLesson(lessonId)` callback that warms the lesson
 * editor's cold path before navigation:
 *
 * - first page of `lesson_blocks` (the head the editor hydrates with)
 * - the `lesson_block_type_registry` (memoized at module level)
 *
 * Designed to be wired to `onMouseEnter` / `onFocus` of links and buttons that
 * open a lesson. Fire-and-forget; errors are swallowed because the real fetch
 * on navigation will surface them.
 */
export function useLessonPrefetch() {
  return useCallback((lessonId: string | undefined) => {
    if (!lessonId) return
    prefetchLessonBlocksHead(lessonId)
    void fetchLessonBlockTypeRegistry().catch(() => undefined)
  }, [])
}
