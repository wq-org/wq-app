/**
 * Allowed grouping values for `feature_definitions.category` (aligned with seed / admin UI).
 * Store lowercase slugs in the database.
 *
 * `NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM` is a UI sentinel: the user must enter a real slug
 * in the conditional field; that value is normalized and must not match any reserved slug.
 */
export const NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM = 'new category' as const

export const FEATURE_DEFINITION_CATEGORY_OPTIONS = [
  'collaboration',
  'core',
  'engagement',
  'infrastructure',
  'integrations',
  'learning',
  'limits',
  'scheduling',
  NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM,
] as const

export type FeatureDefinitionCategorySlug = (typeof FEATURE_DEFINITION_CATEGORY_OPTIONS)[number]

/** Normalized slug for DB / comparisons (snake_case, lowercase). */
export function normalizeFeatureDefinitionCategorySlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .replace(/^[^a-z]+/, '')
}

const RESERVED_NORMALIZED_CATEGORY_SLUGS: ReadonlySet<string> = new Set(
  FEATURE_DEFINITION_CATEGORY_OPTIONS.map((o) => normalizeFeatureDefinitionCategorySlug(o)).filter(
    (s) => s.length > 0,
  ),
)

/** True if `normalized` is empty or matches any option in {@link FEATURE_DEFINITION_CATEGORY_OPTIONS} (after normalization). */
export function isReservedFeatureDefinitionCategorySlug(normalized: string): boolean {
  if (!normalized) return true
  return RESERVED_NORMALIZED_CATEGORY_SLUGS.has(normalized)
}

export function buildFeatureDefinitionCategoryMenuIds(
  currentValue: string,
  dbCategories: readonly string[] = [],
): string[] {
  const trimmed = currentValue.trim()
  const standard = [...FEATURE_DEFINITION_CATEGORY_OPTIONS]

  // Merge DB categories that aren't already in the hardcoded list
  const standardSet = new Set<string>(standard)
  const extra = dbCategories.filter((c) => c && !standardSet.has(c))

  // Build combined list: hardcoded options + DB-only categories (sorted), then "new category" at the end
  const withoutCustom = standard.filter((s) => s !== NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM)
  const combined = [...withoutCustom, ...extra.sort((a, b) => a.localeCompare(b))]

  // If the current value is not in the combined list and not "new category", prepend it
  const combinedSet = new Set<string>(combined)
  const result: string[] = ['']

  if (trimmed && trimmed !== NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM && !combinedSet.has(trimmed)) {
    result.push(trimmed)
  }

  result.push(...combined, NEW_FEATURE_DEFINITION_CATEGORY_CUSTOM)
  return result
}
