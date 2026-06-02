import { useCallback, useEffect, useState } from 'react'

import {
  createFeatureDefinition,
  deleteFeatureDefinition,
  getFeatureDefinitionById,
  updateFeatureDefinition,
} from '../api/featureDefinitionsApi'
import type {
  FeatureDefinition,
  FeatureDefinitionEditorFormValues,
} from '../types/featureDefinitions.types'

export function useFeatureDefinitionEditor(featureId: string | undefined) {
  const isNew = featureId === 'new'
  const [feature, setFeature] = useState<FeatureDefinition | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew && !!featureId)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (isNew || !featureId) {
      setFeature(null)
      setLoadError(null)
      setNotFound(false)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    setNotFound(false)

    getFeatureDefinitionById(featureId)
      .then((row) => {
        if (cancelled) return
        if (!row) {
          setNotFound(true)
          setFeature(null)
        } else {
          setFeature(row)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [featureId, isNew])

  const save = useCallback(
    async (values: FeatureDefinitionEditorFormValues): Promise<void> => {
      setSaving(true)
      try {
        if (isNew) {
          await createFeatureDefinition({
            key: values.key,
            name: values.name,
            description: values.description.trim() || null,
            category: values.category.trim() || null,
            value_type: values.valueType,
            default_enabled: values.defaultEnabled,
          })
        } else {
          if (!feature) return
          await updateFeatureDefinition(feature.id, {
            name: values.name,
            description: values.description.trim() || null,
            category: values.category.trim() || null,
            value_type: values.valueType,
            default_enabled: values.defaultEnabled,
          })
        }
      } finally {
        setSaving(false)
      }
    },
    [isNew, feature],
  )

  const remove = useCallback(async (): Promise<void> => {
    if (!feature) return
    setDeleting(true)
    try {
      await deleteFeatureDefinition(feature.id)
    } finally {
      setDeleting(false)
    }
  }, [feature])

  return { isNew, feature, isLoading, loadError, notFound, saving, deleting, save, remove }
}
