import { supabase } from '@/lib/supabase'
import { listFeatureDefinitions } from '@/features/admin/api/featureDefinitionsApi'
import { listPlanEntitlements } from '@/features/admin/api/planEntitlementsApi'
import type { FeatureDefinition } from '@/features/admin/types/featureDefinitions.types'
import type { PlanEntitlement } from '@/features/admin/types/planEntitlements.types'

import type { EffectiveFeature, EffectiveFeatureSource } from '../types/licensing.types'

type OverrideRow = {
  feature_id: string
  boolean_value: boolean | null
  integer_value: number | null
  bigint_value: string | null
  text_value: string | null
}

async function listOverrides(institutionId: string): Promise<OverrideRow[]> {
  const { data, error } = await supabase
    .from('institution_entitlement_overrides')
    .select('feature_id, boolean_value, integer_value, bigint_value, text_value')
    .eq('institution_id', institutionId)
  if (error) {
    console.warn('listOverrides:', error.message)
    return []
  }
  return (data ?? []) as OverrideRow[]
}

function valuesFromPlan(p: PlanEntitlement | undefined) {
  return {
    booleanValue: p?.booleanValue ?? null,
    integerValue: p?.integerValue ?? null,
    bigintValue: p?.bigintValue ?? null,
    textValue: p?.textValue ?? null,
  }
}

function valuesFromOverride(o: OverrideRow) {
  return {
    booleanValue: o.boolean_value,
    integerValue: o.integer_value,
    bigintValue: o.bigint_value != null ? String(o.bigint_value) : null,
    textValue: o.text_value,
  }
}

function resolveFeature(
  feature: FeatureDefinition,
  plan: PlanEntitlement | undefined,
  override: OverrideRow | undefined,
): EffectiveFeature {
  let source: EffectiveFeatureSource = 'default'
  let values = {
    booleanValue: feature.valueType === 'boolean' ? feature.defaultEnabled : null,
    integerValue: null as number | null,
    bigintValue: null as string | null,
    textValue: null as string | null,
  }
  if (plan) {
    source = 'plan'
    values = valuesFromPlan(plan)
  }
  if (override) {
    source = 'override'
    values = valuesFromOverride(override)
  }
  return {
    featureId: feature.id,
    key: feature.key,
    name: feature.name || feature.key,
    description: feature.description ?? '',
    category: feature.category ?? 'none',
    valueType: feature.valueType,
    defaultEnabled: feature.defaultEnabled,
    source,
    ...values,
  }
}

export async function fetchEffectiveEntitlements(
  institutionId: string,
  planId: string,
): Promise<EffectiveFeature[]> {
  const [features, planEntitlements, overrides] = await Promise.all([
    listFeatureDefinitions(),
    listPlanEntitlements(planId).catch(() => [] as PlanEntitlement[]),
    listOverrides(institutionId),
  ])

  const planByFeatureId = new Map(planEntitlements.map((p) => [p.featureId, p]))
  const overrideByFeatureId = new Map(overrides.map((o) => [o.feature_id, o]))

  const resolved = features.map((f) =>
    resolveFeature(f, planByFeatureId.get(f.id), overrideByFeatureId.get(f.id)),
  )

  resolved.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
  return resolved
}
