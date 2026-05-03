import { supabase } from '@/lib/supabase'
import { ENTITLEMENT_VALUE_TYPES, type EntitlementValueType } from '@/features/admin'
import type { EffectiveFeature, EffectiveFeatureSource } from '@/features/institution-admin'

import type { ListMyInstitutionFeatureFlagRow } from '../types/myInstitutionFeatureFlags.types'

const EFFECTIVE_SOURCES: readonly EffectiveFeatureSource[] = ['default', 'plan', 'override']

function parseValueType(raw: string): EntitlementValueType {
  return (ENTITLEMENT_VALUE_TYPES as readonly string[]).includes(raw)
    ? (raw as EntitlementValueType)
    : 'boolean'
}

function parseSource(raw: string): EffectiveFeatureSource {
  return (EFFECTIVE_SOURCES as readonly string[]).includes(raw)
    ? (raw as EffectiveFeatureSource)
    : 'default'
}

function bigintToString(value: number | string | null | undefined): string | null {
  if (value == null) return null
  if (typeof value === 'string') return value
  return String(value)
}

export function mapFeatureFlagRowToEffectiveFeature(
  row: ListMyInstitutionFeatureFlagRow,
): EffectiveFeature {
  return {
    featureId: row.feature_id,
    key: row.feature_key,
    name: row.feature_name,
    description: row.feature_description,
    category: row.feature_category,
    valueType: parseValueType(row.value_type),
    defaultEnabled: row.default_enabled,
    booleanValue: row.boolean_value,
    integerValue: row.integer_value,
    bigintValue: bigintToString(row.bigint_value),
    textValue: row.text_value,
    source: parseSource(row.source),
  }
}

export type ListMyInstitutionFeatureFlagsResult = {
  planCode: string | null
  features: EffectiveFeature[]
}

export async function listMyInstitutionFeatureFlags(): Promise<ListMyInstitutionFeatureFlagsResult> {
  const { data, error } = await supabase.rpc('list_my_institution_feature_flags')

  if (error) {
    console.error('listMyInstitutionFeatureFlags:', error)
    throw new Error(error.message)
  }

  const rows = (data ?? []) as ListMyInstitutionFeatureFlagRow[]
  if (rows.length === 0) {
    return { planCode: null, features: [] }
  }

  const planCode = rows[0]?.plan_code ?? null
  const features = rows.map(mapFeatureFlagRowToEffectiveFeature)
  return { planCode, features }
}
