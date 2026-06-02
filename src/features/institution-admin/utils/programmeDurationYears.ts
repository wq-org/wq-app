/**
 * Programme duration in years: 1, 1.5, …, 10 (0.5 steps). Indices use half-years
 * so values stay exact (avoids float drift from repeated 0.5 addition).
 */
export const PROGRAMME_DURATION_YEAR_OPTIONS: readonly number[] = Object.freeze(
  Array.from({ length: 19 }, (_, index) => (2 + index) / 2),
)

export function formatProgrammeDurationYearLabel(years: number): string {
  const rounded = Math.round(years * 2) / 2
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/** Highlights the matching row when values come from the DB with float noise. */
export function isProgrammeDurationYearOptionSelected(
  optionYears: number,
  selectedYears: number | null,
): boolean {
  return selectedYears !== null && Math.abs(optionYears - selectedYears) < 1e-9
}
