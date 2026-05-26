/** Example points for PSCA copy: Score 0.437 × maxPoints (from architecture doc worked example). */
export function formatPscaExamplePoints(maxPoints: number): string {
  const raw = maxPoints * 0.437
  const rounded = Math.round(raw * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}
