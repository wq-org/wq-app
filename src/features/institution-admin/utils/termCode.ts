/**
 * Builds a suggested term code like `2026S1` or `2026W1`.
 * Uses academic year + semester band from referenceDate:
 * months 4–9 → summer term (S), otherwise winter term (W).
 * Append `1` as initial term index within that band (adjust later if multi-term UX exists).
 */
export function suggestTermCode(academicYear: number, referenceDate: Date = new Date()): string {
  const month = referenceDate.getMonth() + 1
  const semesterLetter = month >= 4 && month <= 9 ? 'S' : 'W'
  return `${academicYear}${semesterLetter}1`
}

/** Inclusive integer range `[min, max]`, descending (newest first when min < max reversed). */
export function yearRangeInclusive(min: number, max: number): readonly number[] {
  if (min > max) return []
  const out: number[] = []
  for (let y = max; y >= min; y -= 1) out.push(y)
  return out
}
