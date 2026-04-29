import {
  ACADEMIC_YEAR_MAX,
  clampAcademicYear,
  deriveProgrammeAcronymFromTitle,
  extractTermCodePrefix,
} from './termCode'

/**
 * Next academic year for a new cohort: prefers the calendar fallback when no cohorts exist,
 * otherwise the smallest year ≥ max(latest cohort year + 1, fallback) that is not already taken.
 */
export function computeNextAcademicYearForProgramme(
  existingCohortYears: readonly number[],
  fallbackYear: number,
): number {
  const fb = clampAcademicYear(fallbackYear)
  const normalized = existingCohortYears.map((y) => clampAcademicYear(y))
  if (normalized.length === 0) return fb

  const used = new Set(normalized)
  let y = Math.max(fb, Math.max(...normalized) + 1)
  while (used.has(y) && y < ACADEMIC_YEAR_MAX) {
    y += 1
  }
  return clampAcademicYear(y)
}

export type SuggestCohortShortTitleInput = {
  programmeName: string
  academicYear: number
  offeringTermCodes: readonly (string | null | undefined)[]
  /** When true: `Programme name - PREFIX-YEAR`, otherwise `PREFIX-YEAR` only. */
  descriptive?: boolean
}

/**
 * Cohort title like `GVM-2027` or `Mode Design - GVM-2027`, using programme-offering term prefixes
 * when available, otherwise an acronym from the programme title.
 */
export function suggestCohortShortTitle(input: SuggestCohortShortTitleInput): string {
  const prefixFromOfferings =
    input.offeringTermCodes.map((c) => extractTermCodePrefix(c)).find((p) => p && p.length > 0) ??
    null

  const trimmedName = input.programmeName.trim()
  const prefix =
    prefixFromOfferings ??
    (trimmedName.length > 0 ? deriveProgrammeAcronymFromTitle(trimmedName) : '') ??
    ''

  const year = clampAcademicYear(input.academicYear)
  if (!prefix) {
    return String(year)
  }

  const short = `${prefix}-${year}`
  if (input.descriptive && trimmedName.length > 0) {
    return `${trimmedName} - ${short}`
  }
  return short
}
