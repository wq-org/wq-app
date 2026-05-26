/** Fallback label when a dynamic tab has no title yet. Prefer a translated string at call sites. */
export const SELECT_TABS_DEFAULT_TAB_TITLE = 'New Tab'

export function resolveSelectTabDisplayTitle(
  title: string,
  fallback: string = SELECT_TABS_DEFAULT_TAB_TITLE,
): string {
  const trimmed = title.trim()
  return trimmed.length > 0 ? trimmed : fallback
}
