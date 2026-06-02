import type { CohortRecord } from '../types/cohort.types'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { deriveProgrammeAcronymFromTitle, extractTermCodePrefix } from './termCode'

const YEARS = [1, 2, 3, 4] as const
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const

/**
 * Prefix for class group codes like `PF-1A`: prefers programme-offering term codes for the
 * cohort academic year, then prefix from cohort short title, then any offering, then programme acronym.
 */
export function resolveClassGroupTitlePrefix(params: {
  cohort: CohortRecord | null | undefined
  programmeOfferings: readonly ProgrammeOfferingRecord[]
  programmeName: string
}): string {
  const cohort = params.cohort
  const year = cohort?.academic_year

  const forYear =
    year != null && Number.isFinite(year)
      ? params.programmeOfferings.filter((r) => r.academic_year === year)
      : params.programmeOfferings

  const offeringPool = forYear.length > 0 ? forYear : params.programmeOfferings

  for (const row of offeringPool) {
    const tc = row.term_code?.trim()
    if (!tc) continue
    const p = extractTermCodePrefix(tc)
    if (p) return p
  }

  const cohortName = cohort?.name?.trim()
  if (cohortName) {
    const fromCohort = extractTermCodePrefix(cohortName)
    if (fromCohort) return fromCohort
  }

  const prog = params.programmeName.trim()
  return prog ? deriveProgrammeAcronymFromTitle(prog) : ''
}

export type SuggestNextClassGroupTitleInput = {
  prefix: string
  existingNames: readonly string[]
}

/**
 * Next free title e.g. `PF-1A` … `PF-4F`, skipping names already used in the cohort (case-insensitive).
 */
export function suggestNextClassGroupTitle(input: SuggestNextClassGroupTitleInput): string | null {
  const prefix = input.prefix.trim()
  if (!prefix) return null

  const used = new Set(
    input.existingNames.map((n) => n.trim().toLowerCase()).filter((s) => s.length > 0),
  )

  for (const year of YEARS) {
    for (const letter of LETTERS) {
      const candidate = `${prefix}-${year}${letter}`
      if (!used.has(candidate.toLowerCase())) {
        return candidate
      }
    }
  }

  return null
}
