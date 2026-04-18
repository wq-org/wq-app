/**
 * Splits pasted bulk text on commas and/or whitespace; dedupes while preserving first-seen order.
 */
export function parseBulkEmailTokens(raw: string): readonly string[] {
  const tokens = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const seen = new Set<string>()
  const ordered: string[] = []

  for (const token of tokens) {
    if (seen.has(token)) continue
    seen.add(token)
    ordered.push(token)
  }

  return ordered
}
