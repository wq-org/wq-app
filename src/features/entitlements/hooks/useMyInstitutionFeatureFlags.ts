import { useCallback, useEffect, useState } from 'react'

import type { EffectiveFeature } from '@/features/institution-admin'

import { listMyInstitutionFeatureFlags } from '../api/listMyInstitutionFeatureFlagsApi'

export type UseMyInstitutionFeatureFlagsResult = {
  features: EffectiveFeature[]
  planCode: string | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useMyInstitutionFeatureFlags(enabled: boolean): UseMyInstitutionFeatureFlagsResult {
  const [features, setFeatures] = useState<EffectiveFeature[]>([])
  const [planCode, setPlanCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(enabled))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) {
      setFeatures([])
      setPlanCode(null)
      setError(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const result = await listMyInstitutionFeatureFlags()
      setFeatures(result.features)
      setPlanCode(result.planCode)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setFeatures([])
      setPlanCode(null)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  return {
    features,
    planCode,
    isLoading,
    error,
    refresh: load,
  }
}
