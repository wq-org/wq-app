import { useCallback, useEffect, useRef, useState } from 'react'

import { getCourseVersionTree, listCourseVersionHistory } from '../api/courseVersionApi'
import type { CourseVersionHistoryEntry } from '../types/course-release.types'
import type { PublishedCourseVersion } from '../types/course-version.types'
import { comparePublishedVersions } from '../utils/courseRelease.utils'

type UseCourseVersionHistoryParams = {
  courseId: string | undefined
}

function buildHistoryEntries(
  summaries: Awaited<ReturnType<typeof listCourseVersionHistory>>,
  treesByVersionId: Map<string, PublishedCourseVersion>,
): CourseVersionHistoryEntry[] {
  return summaries.map((summary, index) => {
    const currentTree = treesByVersionId.get(summary.id)
    const previousSummary = summaries[index + 1]
    const previousTree = previousSummary ? (treesByVersionId.get(previousSummary.id) ?? null) : null

    if (!currentTree) {
      return {
        ...summary,
        releaseType: 'patch',
        changeSummaryKeys: [],
      }
    }

    const { releaseType, changeSummaryKeys } = comparePublishedVersions(currentTree, previousTree)

    return {
      ...summary,
      releaseType,
      changeSummaryKeys,
    }
  })
}

export function useCourseVersionHistory({ courseId }: UseCourseVersionHistoryParams) {
  const [entries, setEntries] = useState<CourseVersionHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(courseId?.trim()))
  const [error, setError] = useState<string | null>(null)
  const treeCacheRef = useRef<Map<string, PublishedCourseVersion>>(new Map())
  const treeLoadPromisesRef = useRef<Map<string, Promise<PublishedCourseVersion>>>(new Map())

  const loadVersionTree = useCallback(
    async (versionId: string): Promise<PublishedCourseVersion> => {
      const cached = treeCacheRef.current.get(versionId)
      if (cached) return cached

      const pending = treeLoadPromisesRef.current.get(versionId)
      if (pending) return pending

      const promise = getCourseVersionTree(versionId).then((tree) => {
        treeCacheRef.current.set(versionId, tree)
        treeLoadPromisesRef.current.delete(versionId)
        return tree
      })

      treeLoadPromisesRef.current.set(versionId, promise)
      return promise
    },
    [],
  )

  const reload = useCallback(async () => {
    const trimmedCourseId = courseId?.trim()
    if (!trimmedCourseId) {
      setEntries([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const summaries = await listCourseVersionHistory(trimmedCourseId)
      const versionIdsToPrefetch = summaries.slice(0, 3).map((row) => row.id)
      const previousIds = summaries
        .slice(0, 3)
        .map((_, index) => summaries[index + 1]?.id)
        .filter((id): id is string => Boolean(id))
      const prefetchIds = [...new Set([...versionIdsToPrefetch, ...previousIds])]

      await Promise.all(prefetchIds.map((id) => loadVersionTree(id)))

      setEntries(buildHistoryEntries(summaries, treeCacheRef.current))

      if (summaries.length > 3) {
        void Promise.all(summaries.slice(3).map((row) => loadVersionTree(row.id))).then(() => {
          setEntries(buildHistoryEntries(summaries, treeCacheRef.current))
        })
      }
    } catch (err: unknown) {
      setEntries([])
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setIsLoading(false)
    }
  }, [courseId, loadVersionTree])

  useEffect(() => {
    treeCacheRef.current = new Map()
    treeLoadPromisesRef.current = new Map()
    void reload()
  }, [reload])

  return {
    entries,
    isLoading,
    error,
    reload,
    loadVersionTree,
  }
}
