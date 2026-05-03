/**
 * Builds a suggested term code like `2026S1` or `2026W1`.
 * Uses academic year + semester band from referenceDate:
 * months 4–9 → summer term (S), otherwise winter term (W).
 */
export function suggestTermCode(academicYear: number, referenceDate: Date = new Date()): string {
  const month = referenceDate.getMonth() + 1
  const semesterLetter = month >= 4 && month <= 9 ? 'S' : 'W'
  return `${academicYear}${semesterLetter}1`
}

/** Inclusive integer range `[min, max]`, ascending. */
export function yearRangeInclusive(min: number, max: number): readonly number[] {
  if (min > max) return []
  const out: number[] = []
  for (let y = min; y <= max; y += 1) out.push(y)
  return out
}

export const ACADEMIC_YEAR_MIN = 1999
export const ACADEMIC_YEAR_MAX = 2099

/** Academic years for UI pickers (oldest first: 1999 … 2099). */
export const ACADEMIC_YEAR_OPTIONS: readonly number[] = yearRangeInclusive(
  ACADEMIC_YEAR_MIN,
  ACADEMIC_YEAR_MAX,
)

export function clampAcademicYear(year: number): number {
  if (!Number.isFinite(year)) return new Date().getFullYear()
  return Math.min(Math.max(Math.round(year), ACADEMIC_YEAR_MIN), ACADEMIC_YEAR_MAX)
}

// ---------------------------------------------------------------------------
// Term-code derivation
// ---------------------------------------------------------------------------

/**
 * Words stripped before building a term-code acronym.
 * Organised by language / domain — keep as one Set for O(1) lookup.
 *
 * NOT a translation resource: these are never rendered, only used programmatically.
 */
export const STOP_WORDS = new Set([
  // ── German: conjunctions & prepositions ──────────────────────────────────
  'für',
  'fuer',
  'und',
  'oder',
  'mit',
  'in',
  'im',
  'an',
  'am',
  'auf',
  'bei',
  'von',
  'vom',
  'zu',
  'zur',
  'zum',
  'als',
  'nach',
  'aus',
  'über',
  'ueber',

  // ── English ──────────────────────────────────────────────────────────────
  'the',
  'of',
  'for',
  'and',
  'with',
  'to',
  'a',
  'an',

  // ── Legal / org suffixes ─────────────────────────────────────────────────
  'ggmbh',
  'gmbh',
  'ag',
  'ev',

  // ── Generic education / institution words ────────────────────────────────
  'ausbildung',
  'studium',
  'studiengang',
  'studiengaenge',
  'bachelor',
  'master',
  'bsc',
  'ba',
  'msc',
  'ma',
  'beng',
  'meng',
  'hochschule',
  'universitaet',
  'universitat',
  'schule',
  'akademie',
  'berufsschule',
  'berufsfachschule',
  'fachschule',
  'berufskolleg',
  'klinik',
  'kliniken',
  'kreiskliniken',
  'krankenhaus',
  'weiterbildung',
  'allgemeinbildung',
  'kooperation',
  'lehrgang',
  'fernlehrgang',

  // ── Degree qualifiers ────────────────────────────────────────────────────
  'berufsbegleitend',
  'dual',
  'duale',
  'kooperativ',
  'praxisintegriert',
  'konsekutiv',
  'interdisziplinaer',
  'interdisziplinär',
  'angewandte',
  'angewandter',
  'angewandtes',
  'international',
  'interkulturell',
  'europaeisch',
  'europäisch',
  'global',
  'digitale',
  'digitaler',
  'digitales',
  'digitalisierung',

  // ── Healthcare titles (Kreiskliniken domain) ─────────────────────────────
  'fachkraft',
  'assistenz',
  'assistent',
  'assistentin',
  'technologe',
  'technologin',
  'technische',
  'technischer',
  'technisches',
  'technisch',
  'angestellte',
  'angestellter',
  'fachangestellte',
  'fachangestellter',
  'pflegefachfrau',
  'pflegefachmann',
  'pflegefachkraft',
  'pflegehilfe',
  'helfer',
  'helferin',
  'pflege',
  'gesundheits',
  'krankenpflege',
  'krankenpflegehilfe',
  'medizinische',
  'medizinischer',
  'medizinprodukte',
  'medizinprodukteaufbereitung',
  'pharmazeutisch',
  'pharmazeutische',
  'pharmazeutischer',
  'operationstechnische',
  'operationstechnischer',
  'anaesthesietechnische',
  'anästhesietechnische',

  // ── Farbe & Gestaltung ───────────────────────────────────────────────────
  'gestalter',
  'gestalterin',
  'fachpraktiker',
  'fachpraktikerin',
  'gepruefte',
  'geprüfte',
  'geprüfter',
  'vorarbeiter',
  'vorarbeiterin',
  'meister',
  'meisterin',
  'meisterschule',
  'lackierer',
  'lackiererin',
  'maler',
  'malerin',

  // ── Gender suffixes ──────────────────────────────────────────────────────
  'mwd',
  'mw',
  'mf',
  'mfd',
  'mfdivers',
  'divers',
])

/** Exported for cohort naming — same logic as programme-offering term prefixes. */
export function deriveProgrammeAcronymFromTitle(termName: string): string {
  const words = termName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (ü → u, ö → o, ä → a …)
    .replace(/[^a-zA-Z\s-]/g, ' ') // remove non-alpha chars
    .split(/[\s\-/]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()))

  return words
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
    .slice(0, 6)
}

/**
 * Prefix segment before the first hyphen (e.g. `MD` from `MD-2028/31` or `GVM` from `GVM-2026`).
 */
export function extractTermCodePrefix(termCode: string | null | undefined): string | null {
  const raw = termCode?.trim()
  if (!raw) return null
  const dash = raw.indexOf('-')
  if (dash <= 0) return null
  const prefix = raw.slice(0, dash).trim()
  return prefix.length > 0 ? prefix : null
}

/**
 * Derives a short term code from a programme name, cohort start year, and programme duration.
 * Shape: `{ACRONYM}-{startYear}/{endSuffix}` — end uses two digits when the end year is in the
 * same century as the start year (e.g. MD-2028/31).
 *
 * Result is a suggestion — always let the admin confirm or edit before saving.
 *
 * @example
 * buildTermCode('Gestalter für Visuelles Marketing', 2026, 3) → 'GVM-2026/29'
 * buildTermCode('Master Diagnostik', 2028, 3) → 'MD-2028/31'
 */
export function buildTermCode(
  termName: string,
  startYear: number,
  durationYears: number = 3,
): string {
  const acronym = deriveProgrammeAcronymFromTitle(termName)
  const durationRounded = Math.max(1, Math.round(durationYears))
  const endYear = startYear + durationRounded
  const sameCentury = Math.floor(endYear / 100) === Math.floor(startYear / 100)
  const endSegment = sameCentury ? String(endYear).slice(-2) : String(endYear)

  if (!acronym) {
    return `${startYear}/${endSegment}`
  }
  return `${acronym}-${startYear}/${endSegment}`
}

/**
 * Suggested term code from a programme title, academic start year, and optional programme duration.
 * Empty / whitespace title → `''`.
 */
export function deriveSuggestedTermCode(
  programmeTitle: string | null | undefined,
  startYear: number,
  durationYears?: number | null,
): string {
  const name = programmeTitle?.trim() ?? ''
  if (name.length === 0) return ''
  const duration =
    durationYears != null && Number.isFinite(durationYears) && durationYears > 0 ? durationYears : 3
  return buildTermCode(name, startYear, duration)
}

/**
 * Normalises user input: keeps letters, digits, underscore, hyphen, slash; collapses repeated
 * slashes and hyphens; trims stray separators at the ends. Case is preserved.
 */
export function normalizeTermCode(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9_/-]/g, '')
    .replace(/\/+/g, '/')
    .replace(/-+/g, '-')
    .replace(/^[/-]+|[/-]+$/g, '')
}

/** Legacy single-year shape (still valid for existing rows). */
export const LEGACY_TERM_CODE_PATTERN = /^[A-Za-z0-9_]{1,12}-\d{4}$/

/** Span shape: prefix, start year, slash, end year (2 or 4 digits). */
export const SPAN_TERM_CODE_PATTERN = /^[A-Za-z0-9_]{1,12}-\d{4}\/\d{2,4}$/

/** When no acronym can be derived, only years remain (rare). */
export const BARE_YEAR_SPAN_PATTERN = /^\d{4}\/\d{2,4}$/

/** Accepts legacy, span, or bare year-span term codes. */
export const TERM_CODE_PATTERN =
  /^(?:[A-Za-z0-9_]{1,12}-\d{4}|[A-Za-z0-9_]{1,12}-\d{4}\/\d{2,4}|\d{4}\/\d{2,4})$/

export function isValidTermCode(code: string): boolean {
  const trimmed = code.trim()
  return (
    LEGACY_TERM_CODE_PATTERN.test(trimmed) ||
    SPAN_TERM_CODE_PATTERN.test(trimmed) ||
    BARE_YEAR_SPAN_PATTERN.test(trimmed)
  )
}

/**
 * True when the term code matches a supported format (legacy single-year, span, or bare years).
 * Still named for historical reasons — callers use it before syncing cohort names from the code.
 */
export function isAutoGeneratedTermCode(termCode: string): boolean {
  return isValidTermCode(termCode)
}

// ---------------------------------------------------------------------------
// Cohort name derivation
// ---------------------------------------------------------------------------

/**
 * Builds a cohort display name from a term code and locale.
 *
 * @example
 * buildCohortNameFromTermCode('GVM-2026', 'de') → 'GVM Jahrgang 2026'
 * buildCohortNameFromTermCode('GVM-2026', 'en') → 'GVM Year 2026'
 */
export function buildCohortNameFromTermCode(termCode: string, lang: 'de' | 'en' = 'de'): string {
  const dashIndex = termCode.indexOf('-')
  const prefix = dashIndex >= 0 ? termCode.slice(0, dashIndex) : termCode
  const year = dashIndex >= 0 ? termCode.slice(dashIndex + 1) : ''
  const yearWord = lang === 'de' ? 'Jahrgang' : 'Year'
  return year ? `${prefix} ${yearWord} ${year}` : prefix
}

/**
 * Returns true when a cohort name matches the auto-generated `PREFIX Jahrgang/Year YEAR` pattern.
 * Used alongside `isAutoGeneratedTermCode` to guard auto-derivation.
 */
export function isAutoGeneratedCohortName(cohortName: string): boolean {
  return /^[A-Za-z0-9_]+ (Jahrgang|Year) \d{4}(?:\/\d{2,4})?$/.test(cohortName)
}

// ---------------------------------------------------------------------------
// Class-group suggestion generation
// ---------------------------------------------------------------------------

const CLASS_GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
const CLASS_GROUP_YEAR_GROUPS = [1, 2, 3, 4] as const

/**
 * Generates ordered class-group name suggestions from a term code.
 * Items are interleaved so that a `flex-direction:column` wrap with 2 rows gives:
 *
 *   Row 0:  PREFIX-1A │ PREFIX-1B │ … │ PREFIX-1F │ [PREFIX-3A … on expand]
 *   Row 1:  PREFIX-2A │ PREFIX-2B │ … │ PREFIX-2F │ [PREFIX-4A … on expand]
 *
 * 4 year-groups × 6 letters = 24 total suggestions.
 *
 * @example generateClassGroupSuggestions('GVM-2026')
 * // → ['GVM-1A','GVM-2A','GVM-1B','GVM-2B', … 'GVM-3A','GVM-4A', …]
 */
export function generateClassGroupSuggestions(termCode: string): readonly string[] {
  const dashIndex = termCode.indexOf('-')
  const prefix = dashIndex >= 0 ? termCode.slice(0, dashIndex) : termCode
  if (!prefix) return []

  const suggestions: string[] = []

  // Year groups 1+2 first (visible without scrolling), then 3+4 (revealed on expand).
  for (const letter of CLASS_GROUP_LETTERS) {
    suggestions.push(`${prefix}-${CLASS_GROUP_YEAR_GROUPS[0]}${letter}`)
    suggestions.push(`${prefix}-${CLASS_GROUP_YEAR_GROUPS[1]}${letter}`)
  }
  for (const letter of CLASS_GROUP_LETTERS) {
    suggestions.push(`${prefix}-${CLASS_GROUP_YEAR_GROUPS[2]}${letter}`)
    suggestions.push(`${prefix}-${CLASS_GROUP_YEAR_GROUPS[3]}${letter}`)
  }

  return suggestions
}
