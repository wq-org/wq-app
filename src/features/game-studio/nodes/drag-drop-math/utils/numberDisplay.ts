/** Locale for thousand separators in math/sigma UI (e.g. `1.000.000`). */
export const MATH_DISPLAY_NUMBER_LOCALE = 'de-DE' as const

/**
 * Formats a finite number for display with locale grouping (DE: `.` thousands, `,` decimals).
 */
export function formatGroupedNumber(value: number, locale = MATH_DISPLAY_NUMBER_LOCALE): string {
  if (!Number.isFinite(value)) {
    throw new Error('formatGroupedNumber expects a finite number')
  }

  const rounded = Math.round(value * 1e10) / 1e10
  if (Object.is(rounded, -0)) return '0'

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 10,
    minimumFractionDigits: 0,
  }).format(rounded)
}
