import { useCallback, useEffect, useState } from 'react'

import { listFeatureDefinitionCategories } from '../api/featureDefinitionsApi'

/**
 * Fetches distinct category slugs stored in `feature_definitions`.
 * Merges with the hardcoded defaults in the popover so custom categories
 * created by any user are globally visible.
 */
export function useFeatureDefinitionCategories() {
  const [dbCategories, setDbCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const cats = await listFeatureDefinitionCategories()
      setDbCategories(cats)
    } catch {
      // non-critical – the hardcoded list still works
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { dbCategories, isLoading, refresh }
}
