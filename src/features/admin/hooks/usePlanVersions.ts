import { useCallback, useEffect, useState } from 'react'
import { listPlanVersions, publishPlanVersion } from '../api/planVersionsApi'
import type { PlanVersion } from '../types/planVersions.types'

export function usePlanVersions(planId: string | undefined) {
  const [versions, setVersions] = useState<PlanVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!planId) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await listPlanVersions(planId)
      setVersions(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load versions')
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    void load()
  }, [load])

  const publish = useCallback(
    async (changeNote?: string): Promise<PlanVersion> => {
      if (!planId) throw new Error('No plan selected')
      setIsPublishing(true)
      try {
        const version = await publishPlanVersion(planId, changeNote)
        setVersions((prev) => [version, ...prev])
        return version
      } finally {
        setIsPublishing(false)
      }
    },
    [planId],
  )

  return { versions, isLoading, isPublishing, error, publish, reload: load }
}
