import type { EffectiveFeature, EffectiveFeatureGroup } from '../types/licensing.types'

export function groupByCategory(features: EffectiveFeature[]): EffectiveFeatureGroup[] {
  const groups = new Map<string, EffectiveFeature[]>()
  for (const f of features) {
    const list = groups.get(f.category) ?? []
    list.push(f)
    groups.set(f.category, list)
  }
  return [...groups.entries()].map(([category, list]) => ({ category, features: list }))
}
