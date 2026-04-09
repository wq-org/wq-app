import { supabase } from '@/lib/supabase'
import type {
  EntitlementValueType,
  FeatureDefinition,
  FeatureDefinitionInsert,
  FeatureDefinitionRow,
  FeatureDefinitionUpdate,
} from '../types/featureDefinitions.types'
import { ENTITLEMENT_VALUE_TYPES, FEATURE_KEY_PATTERN } from '../types/featureDefinitions.types'

const COLUMNS =
  'id, key, name, description, category, value_type, default_enabled, created_at, updated_at' as const

function isEntitlementValueType(value: string): value is EntitlementValueType {
  return (ENTITLEMENT_VALUE_TYPES as readonly string[]).includes(value)
}

export function assertValidFeatureKey(key: string): void {
  const trimmed = key.trim()
  if (!trimmed) {
    throw new Error('Key is required')
  }
  if (!FEATURE_KEY_PATTERN.test(trimmed)) {
    throw new Error(
      'Key must be lowercase snake_case: start with a letter, then letters, digits, or underscores.',
    )
  }
}

function mapRow(row: FeatureDefinitionRow): FeatureDefinition {
  const vt = row.value_type
  if (!isEntitlementValueType(vt)) {
    throw new Error(`Unknown value_type: ${String(vt)}`)
  }
  return {
    id: row.id,
    key: row.key,
    name: row.name ?? '',
    description: row.description ?? '',
    category: row.category ?? '',
    valueType: vt,
    defaultEnabled: row.default_enabled,
    updatedAt: row.updated_at,
  }
}

export async function listFeatureDefinitions(): Promise<FeatureDefinition[]> {
  const { data, error } = await supabase
    .from('feature_definitions')
    .select(COLUMNS)
    .order('key', { ascending: true })

  if (error) {
    console.error('listFeatureDefinitions:', error)
    throw new Error(error.message)
  }

  return (data as FeatureDefinitionRow[]).map(mapRow)
}

export async function getFeatureDefinitionById(id: string): Promise<FeatureDefinition | null> {
  const { data, error } = await supabase
    .from('feature_definitions')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('getFeatureDefinitionById:', error)
    throw new Error(error.message)
  }

  if (!data) return null
  return mapRow(data as FeatureDefinitionRow)
}

export async function createFeatureDefinition(
  payload: FeatureDefinitionInsert,
): Promise<FeatureDefinition> {
  assertValidFeatureKey(payload.key)

  const { data, error } = await supabase
    .from('feature_definitions')
    .insert({
      key: payload.key.trim(),
      name: payload.name.trim() || null,
      description: payload.description?.trim() ? payload.description.trim() : null,
      category: payload.category?.trim() ? payload.category.trim() : null,
      value_type: payload.value_type,
      default_enabled: payload.default_enabled,
    })
    .select(COLUMNS)
    .single()

  if (error) {
    console.error('createFeatureDefinition:', error)
    throw new Error(error.message)
  }

  return mapRow(data as FeatureDefinitionRow)
}

export async function updateFeatureDefinition(
  id: string,
  payload: FeatureDefinitionUpdate,
): Promise<FeatureDefinition> {
  const { data, error } = await supabase
    .from('feature_definitions')
    .update({
      name: payload.name.trim() || null,
      description: payload.description?.trim() ? payload.description.trim() : null,
      category: payload.category?.trim() ? payload.category.trim() : null,
      value_type: payload.value_type,
      default_enabled: payload.default_enabled,
    })
    .eq('id', id)
    .select(COLUMNS)
    .single()

  if (error) {
    console.error('updateFeatureDefinition:', error)
    throw new Error(error.message)
  }

  return mapRow(data as FeatureDefinitionRow)
}

/** Returns distinct non-null category slugs already stored in `feature_definitions`. */
export async function listFeatureDefinitionCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('feature_definitions')
    .select('category')
    .not('category', 'is', null)

  if (error) {
    console.error('listFeatureDefinitionCategories:', error)
    throw new Error(error.message)
  }

  const unique = [
    ...new Set((data as { category: string }[]).map((r) => r.category.trim()).filter(Boolean)),
  ]
  unique.sort((a, b) => a.localeCompare(b))
  return unique
}

/** Hard delete. Fails with a Postgres FK error if plan_entitlements or overrides reference this feature. */
export async function deleteFeatureDefinition(id: string): Promise<void> {
  const { error } = await supabase.from('feature_definitions').delete().eq('id', id)

  if (error) {
    console.error('deleteFeatureDefinition:', error)
    throw new Error(error.message)
  }
}
