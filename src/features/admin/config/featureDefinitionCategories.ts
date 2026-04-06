/**
 * Allowed grouping values for `feature_definitions.category` (aligned with seed / admin UI).
 * Store lowercase slugs in the database.
 */
export const FEATURE_DEFINITION_CATEGORY_OPTIONS = [
  'collaboration',
  'core',
  'engagement',
  'infrastructure',
  'learning',
  'limits',
  'scheduling',
] as const

export type FeatureDefinitionCategorySlug = (typeof FEATURE_DEFINITION_CATEGORY_OPTIONS)[number]

export function buildFeatureDefinitionCategoryMenuIds(currentValue: string): string[] {
  const trimmed = currentValue.trim()
  const standard = [...FEATURE_DEFINITION_CATEGORY_OPTIONS]

  if (!trimmed) {
    return ['', ...standard]
  }

  if ((standard as readonly string[]).includes(trimmed)) {
    return ['', ...standard]
  }

  return ['', trimmed, ...standard]
}
