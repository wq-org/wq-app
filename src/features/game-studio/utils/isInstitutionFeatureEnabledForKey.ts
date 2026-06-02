import type { EffectiveFeature } from '@/features/institution-admin'

import type { GameNodeRegistryEntry } from '../nodes/_registry/game-node-registry.types'

/** Whether an institution entitlement grants this feature key (boolean catalog rows). */
export function isInstitutionFeatureEnabledForKey(
  features: readonly EffectiveFeature[],
  key: string,
): boolean {
  const f = features.find((x) => x.key === key)
  if (!f) return false
  if (f.valueType === 'boolean') {
    return f.booleanValue ?? f.defaultEnabled
  }
  return false
}

/** Sidebar drag + canvas drop: optional static disable, then institution feature key. */
export function isGameNodeRegistryEntryEnabled(
  entry: Pick<GameNodeRegistryEntry, 'disabled' | 'featureKey'>,
  features: readonly EffectiveFeature[],
): boolean {
  if (entry.disabled === true) return false
  if (entry.featureKey && !isInstitutionFeatureEnabledForKey(features, entry.featureKey)) {
    return false
  }
  return true
}
