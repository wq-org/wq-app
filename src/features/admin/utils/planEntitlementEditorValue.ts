import type { FeatureDefinition } from '../types/featureDefinitions.types'
import type { PlanEntitlement, PlanEntitlementEditorValue } from '../types/planEntitlements.types'

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
