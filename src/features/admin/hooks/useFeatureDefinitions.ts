import { useCallback, useEffect, useState } from 'react'

import {
  createFeatureDefinition,
  deleteFeatureDefinition,
  listFeatureDefinitions,
  updateFeatureDefinition,
} from '../api/featureDefinitionsApi'
import type {
  FeatureDefinition,
  FeatureDefinitionInsert,
  FeatureDefinitionUpdate,
} from '../types/featureDefinitions.types'

export function useFeatureDefinitions() {
  const [items, setItems] = useState<FeatureDefinition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    const list = await listFeatureDefinitions()
    setItems(list)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    listFeatureDefinitions()
      .then((list) => {
        if (!cancelled) {
          setItems(list)
          setError(null)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const create = async (payload: FeatureDefinitionInsert): Promise<FeatureDefinition> => {
    const created = await createFeatureDefinition(payload)
    await refresh()
    return created
  }

  const update = async (
    id: string,
    payload: FeatureDefinitionUpdate,
  ): Promise<FeatureDefinition> => {
    const updated = await updateFeatureDefinition(id, payload)
    await refresh()
    return updated
  }

  const remove = async (id: string): Promise<void> => {
    await deleteFeatureDefinition(id)
    await refresh()
  }

  return {
    items,
    isLoading,
    error,
    refresh,
    create,
    update,
    remove,
  }
}
