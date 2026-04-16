import { useCallback, useEffect, useMemo, useState } from 'react'

import { getPlanEntitlementsEditorData, savePlanEntitlements } from '../api/planEntitlementsApi'
import type {
  PlanCatalogEditorPlan,
  PlanEntitlementEditorGroup,
  PlanEntitlementEditorValue,
  PlanEntitlementUpsertPayload,
} from '../types/planEntitlements.types'
import { toPlanEntitlementEditorValue } from '../utils/planEntitlementEditorValue'

type UsePlanEntitlementsResult = {
  plan: PlanCatalogEditorPlan | null
  rows: PlanEntitlementEditorValue[]
  groups: PlanEntitlementEditorGroup[]
  isLoading: boolean
  isSaving: boolean
  hasChanges: boolean
  error: string | null
  setRows: React.Dispatch<React.SetStateAction<PlanEntitlementEditorValue[]>>
  reset: () => Promise<void>
  save: () => Promise<void>
}

function toUpsertRows(
  planId: string,
  rows: PlanEntitlementEditorValue[],
): PlanEntitlementUpsertPayload[] {
  return rows
    .map((row): PlanEntitlementUpsertPayload | null => {
      if (row.valueType === 'boolean') {
        if (row.booleanValue === row.defaultEnabled) return null
        return {
          plan_id: planId,
          feature_id: row.featureId,
          boolean_value: row.booleanValue,
          integer_value: null,
          bigint_value: null,
          text_value: null,
        }
      }

      if (row.valueType === 'integer') {
        const trimmed = row.integerValue.trim()
        if (!trimmed) return null
        const parsed = Number.parseInt(trimmed, 10)
        if (!Number.isFinite(parsed)) return null
        return {
          plan_id: planId,
          feature_id: row.featureId,
          boolean_value: null,
          integer_value: parsed,
          bigint_value: null,
          text_value: null,
        }
      }

      if (row.valueType === 'bigint') {
        const trimmed = String(row.bigintValue ?? '').trim()
        if (!trimmed) return null
        return {
          plan_id: planId,
          feature_id: row.featureId,
          boolean_value: null,
          integer_value: null,
          bigint_value: trimmed,
          text_value: null,
        }
      }

      const text = row.textValue.trim()
      if (!text) return null
      return {
        plan_id: planId,
        feature_id: row.featureId,
        boolean_value: null,
        integer_value: null,
        bigint_value: null,
        text_value: text,
      }
    })
    .filter((row): row is PlanEntitlementUpsertPayload => row !== null)
}

export function usePlanEntitlements(planId: string | undefined): UsePlanEntitlementsResult {
  const [plan, setPlan] = useState<PlanCatalogEditorPlan | null>(null)
  const [rows, setRows] = useState<PlanEntitlementEditorValue[]>([])
  const [originalRows, setOriginalRows] = useState<PlanEntitlementEditorValue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!planId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getPlanEntitlementsEditorData(planId)
      setPlan(data.plan)
      const byFeatureId = new Map(data.entitlements.map((e) => [e.featureId, e]))
      const mapped = data.features.map((feature) =>
        toPlanEntitlementEditorValue(feature, byFeatureId.get(feature.id)),
      )
      setRows(mapped)
      setOriginalRows(mapped)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    void load()
  }, [load])

  const groups = useMemo<PlanEntitlementEditorGroup[]>(() => {
    const grouped = new Map<string, PlanEntitlementEditorValue[]>()
    rows.forEach((row) => {
      const key = row.category.trim() || 'none'
      const bucket = grouped.get(key)
      if (bucket) bucket.push(row)
      else grouped.set(key, [row])
    })

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, features]) => ({
        category,
        features: [...features].sort((a, b) => a.name.localeCompare(b.name)),
      }))
  }, [rows])

  const save = useCallback(async () => {
    if (!planId) return
    setIsSaving(true)
    setError(null)
    try {
      await savePlanEntitlements(planId, toUpsertRows(planId, rows))
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      throw e
    } finally {
      setIsSaving(false)
    }
  }, [load, planId, rows])

  const hasChanges = useMemo(
    () => JSON.stringify(rows) !== JSON.stringify(originalRows),
    [originalRows, rows],
  )

  return {
    plan,
    rows,
    groups,
    isLoading,
    isSaving,
    hasChanges,
    error,
    setRows,
    reset: load,
    save,
  }
}
