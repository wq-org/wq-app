import type { EffectiveFeature } from '@/features/institution-admin'

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
