import { useCallback, useEffect, useState } from 'react'

import {
  countDeliveriesForVersion,
  getClassroomCourseDelivery,
  getCourseVersionTree,
  getLatestPublishedCourseVersionId,
} from '../api/courseVersionApi'
import type { PublishedCourseVersion } from '../types/course-version.types'

type UsePublishedCourseVersionParams = {
  courseId: string | undefined
  courseVersionId?: string | undefined
  classroomId?: string | undefined
}

export function usePublishedCourseVersion({
  courseId,
  courseVersionId,
  classroomId,
}: UsePublishedCourseVersionParams) {
  const [tree, setTree] = useState<PublishedCourseVersion | null>(null)
  const [deliveryCount, setDeliveryCount] = useState(0)
  const [resolvedVersionId, setResolvedVersionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isClassroomLocked = Boolean(classroomId?.trim())

  const loadPublishedVersion = useCallback(async () => {
    const trimmedCourseId = courseId?.trim()
    if (!trimmedCourseId) {
      setTree(null)
      setDeliveryCount(0)
      setResolvedVersionId(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let versionId = courseVersionId?.trim() || null

      if (classroomId?.trim()) {
        const delivery = await getClassroomCourseDelivery(classroomId.trim(), trimmedCourseId)
        if (!delivery) {
          setTree(null)
          setDeliveryCount(0)
          setResolvedVersionId(null)
          setError('delivery_not_found')
          return
        }
        versionId = delivery.courseVersionId
      } else if (!versionId) {
        versionId = await getLatestPublishedCourseVersionId(trimmedCourseId)
      }

      if (!versionId) {
        setTree(null)
        setDeliveryCount(0)
        setResolvedVersionId(null)
        setError('no_published_version')
        return
      }

      const [nextTree, nextDeliveryCount] = await Promise.all([
        getCourseVersionTree(versionId),
        countDeliveriesForVersion(versionId),
      ])

      setTree(nextTree)
      setDeliveryCount(nextDeliveryCount)
      setResolvedVersionId(versionId)
    } catch (err: unknown) {
      setTree(null)
      setDeliveryCount(0)
      setResolvedVersionId(null)
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setIsLoading(false)
    }
  }, [classroomId, courseId, courseVersionId])

  useEffect(() => {
    void loadPublishedVersion()
  }, [loadPublishedVersion])

  return {
    tree,
    deliveryCount,
    resolvedVersionId,
    isLoading,
    error,
    isClassroomLocked,
    reload: loadPublishedVersion,
  }
}
