import type { EntitlementValueType, FeatureDefinition } from './featureDefinitions.types'

export type PlanCatalogRow = {
  id: string
  code: string
  name: string
  description: string | null
  billing_interval: string
  is_active: boolean
  deleted_at: string | null
}

export type PlanCatalog = {
  id: string
  code: string
  name: string
  description: string
  billingInterval: string
  isActive: boolean
}

export type PlanEntitlementRow = {
  id: string
  plan_id: string
  feature_id: string
  boolean_value: boolean | null
  integer_value: number | null
  bigint_value: string | null
  text_value: string | null
}

export type PlanEntitlement = {
  id: string
  planId: string
  featureId: string
  booleanValue: boolean | null
  integerValue: number | null
  bigintValue: string | null
  textValue: string | null
}

export type PlanEntitlementEditorValue = {
  featureId: string
  valueType: EntitlementValueType
  key: string
  name: string
  description: string
  category: string
  defaultEnabled: boolean
  booleanValue: boolean
  integerValue: string
  bigintValue: string
  textValue: string
}

export type PlanEntitlementEditorGroup = {
  category: string
  features: PlanEntitlementEditorValue[]
}

export type PlanEntitlementUpsertPayload = {
  plan_id: string
  feature_id: string
  boolean_value: boolean | null
  integer_value: number | null
  bigint_value: string | null
  text_value: string | null
}

export function toPlanEntitlementEditorValue(
  feature: FeatureDefinition,
  entitlement?: PlanEntitlement,
): PlanEntitlementEditorValue {
  return {
    featureId: feature.id,
    valueType: feature.valueType,
    key: feature.key,
    name: feature.name || feature.key,
    description: feature.description ?? '',
    category: feature.category ?? '',
    defaultEnabled: feature.defaultEnabled,
    booleanValue: entitlement?.booleanValue ?? feature.defaultEnabled,
    integerValue: entitlement?.integerValue != null ? String(entitlement.integerValue) : '',
    bigintValue: entitlement?.bigintValue != null ? String(entitlement.bigintValue) : '',
    textValue: entitlement?.textValue ?? '',
  }
}
