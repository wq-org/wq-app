import { useCallback, useEffect, useMemo, useState } from 'react'

import { getPlanEntitlementsEditorData } from '../api/planEntitlementsApi'
import type {
  PlanEntitlementEditorGroup,
  PlanEntitlementEditorValue,
} from '../types/planEntitlements.types'
import { toPlanEntitlementEditorValue } from '../utils/planEntitlementEditorValue'

type UsePlanPreviewResult = {
  groups: PlanEntitlementEditorGroup[]
  isLoading: boolean
}

export function usePlanPreview(planId: string | undefined): UsePlanPreviewResult {
  const [rows, setRows] = useState<PlanEntitlementEditorValue[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!planId) return
    setIsLoading(true)
    try {
      const data = await getPlanEntitlementsEditorData(planId)
      const byFeatureId = new Map(data.entitlements.map((e) => [e.featureId, e]))
      setRows(
        data.features.map((feature) =>
          toPlanEntitlementEditorValue(feature, byFeatureId.get(feature.id)),
        ),
      )
    } catch {
      // preview is best-effort
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

  return { groups, isLoading }
}
