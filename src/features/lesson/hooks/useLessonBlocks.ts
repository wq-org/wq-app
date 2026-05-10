import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  fetchAllLessonBlocks,
  fetchLessonBlockTypeRegistry,
  fetchLessonBlocksPage,
  syncLessonBlocksForLesson,
} from '../api/lessonBlocksApi'
import type { LessonBlock, LessonBlockTypeRegistryRow } from '../types/lesson.types'

const FIRST_PAGE_SIZE = 10

function scheduleIdle(callback: () => void): number {
  if (typeof requestIdleCallback !== 'undefined') {
    return requestIdleCallback(callback, { timeout: 2000 })
  }
  return window.setTimeout(callback, 1)
}

function cancelIdle(id: number): void {
  if (typeof cancelIdleCallback !== 'undefined') {
    cancelIdleCallback(id)
  } else {
    window.clearTimeout(id)
  }
}

export function useLessonBlocks(lessonId: string | undefined) {
  const [headBlocks, setHeadBlocks] = useState<LessonBlock[]>([])
  const [tailBlocks, setTailBlocks] = useState<LessonBlock[]>([])
  const [registry, setRegistry] = useState<LessonBlockTypeRegistryRow[]>([])
  const [isHeadLoading, setIsHeadLoading] = useState(true)
  const [isTailHydrating, setIsTailHydrating] = useState(false)
  const [isTailHydrated, setIsTailHydrated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const idleCallbackRef = useRef<number | null>(null)
  const lessonLoadRevisionRef = useRef(0)
  const syncRequestRevisionRef = useRef(0)

  const blocks = useMemo(() => {
    const merged = [...headBlocks, ...tailBlocks]
    merged.sort((a, b) => a.order - b.order)
    return merged
  }, [headBlocks, tailBlocks])

  const blocksRef = useRef(blocks)
  blocksRef.current = blocks

  useEffect(() => {
    let cancelled = false

    async function loadRegistry() {
      try {
        const rows = await fetchLessonBlockTypeRegistry()
        if (!cancelled) {
          setRegistry(rows)
        }
      } catch (err: unknown) {
        console.error(err)
      }
    }

    void loadRegistry()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!lessonId) {
      lessonLoadRevisionRef.current += 1
      setHeadBlocks([])
      setTailBlocks([])
      setIsHeadLoading(false)
      setIsTailHydrating(false)
      setIsTailHydrated(true)
      setError(null)
      return
    }

    let cancelled = false
    const loadRevision = lessonLoadRevisionRef.current + 1
    lessonLoadRevisionRef.current = loadRevision
    setHeadBlocks([])
    setTailBlocks([])
    setIsHeadLoading(true)
    setIsTailHydrating(false)
    setIsTailHydrated(false)
    setError(null)

    const resolvedLessonId = lessonId!

    async function loadHead() {
      try {
        const head = await fetchLessonBlocksPage(resolvedLessonId, 0, FIRST_PAGE_SIZE - 1)
        if (!cancelled && lessonLoadRevisionRef.current === loadRevision) {
          setHeadBlocks(head)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load lesson blocks'
          setError(message)
        }
      } finally {
        if (!cancelled && lessonLoadRevisionRef.current === loadRevision) {
          setIsHeadLoading(false)
        }
      }
    }

    void loadHead()

    return () => {
      cancelled = true
      if (idleCallbackRef.current !== null) {
        cancelIdle(idleCallbackRef.current)
        idleCallbackRef.current = null
      }
    }
  }, [lessonId])

  useEffect(() => {
    if (!lessonId || isHeadLoading) {
      return
    }

    const resolvedLessonId = lessonId!

    let cancelled = false

    idleCallbackRef.current = scheduleIdle(() => {
      idleCallbackRef.current = null

      const loadRevision = lessonLoadRevisionRef.current
      async function loadTail() {
        setIsTailHydrating(true)
        try {
          const rest = await fetchLessonBlocksPage(
            resolvedLessonId,
            FIRST_PAGE_SIZE,
            FIRST_PAGE_SIZE + 10000,
          )
          if (!cancelled && lessonLoadRevisionRef.current === loadRevision) {
            setTailBlocks(rest)
          }
        } catch (err: unknown) {
          console.error(err)
          if (!cancelled) {
            const message = err instanceof Error ? err.message : 'Failed to load remaining blocks'
            setError(message)
          }
        } finally {
          if (!cancelled && lessonLoadRevisionRef.current === loadRevision) {
            setIsTailHydrating(false)
            setIsTailHydrated(true)
          }
        }
      }

      void loadTail()
    })

    return () => {
      cancelled = true
      if (idleCallbackRef.current !== null) {
        cancelIdle(idleCallbackRef.current)
        idleCallbackRef.current = null
      }
    }
  }, [lessonId, isHeadLoading])

  const replaceBlocksFromSync = useCallback((next: LessonBlock[]) => {
    setHeadBlocks(next.slice(0, FIRST_PAGE_SIZE))
    setTailBlocks(next.slice(FIRST_PAGE_SIZE))
  }, [])

  const refreshBlocks = useCallback(async () => {
    if (!lessonId) return
    const requestRevision = ++syncRequestRevisionRef.current
    const next = await fetchAllLessonBlocks(lessonId)
    if (requestRevision !== syncRequestRevisionRef.current) {
      return
    }
    replaceBlocksFromSync(next)
  }, [lessonId, replaceBlocksFromSync])

  const isFullyHydrated = !lessonId || (!isHeadLoading && isTailHydrated && !isTailHydrating)

  const persistSerializedBlocks = useCallback(
    async (serializedNodes: import('lexical').SerializedLexicalNode[]) => {
      if (!lessonId) return
      const requestRevision = ++syncRequestRevisionRef.current
      const next = await syncLessonBlocksForLesson(lessonId, blocksRef.current, serializedNodes, {
        allowDeleteTrailing: isFullyHydrated,
      })
      if (requestRevision !== syncRequestRevisionRef.current) {
        return
      }
      replaceBlocksFromSync(next)
    },
    [isFullyHydrated, lessonId, replaceBlocksFromSync],
  )

  return {
    blocks,
    headBlocks,
    tailBlocks,
    registry,
    isHeadLoading,
    isTailHydrating,
    isFullyHydrated,
    isLoading: isHeadLoading,
    error,
    persistSerializedBlocks,
    refreshBlocks,
    replaceBlocksFromSync,
  }
}
