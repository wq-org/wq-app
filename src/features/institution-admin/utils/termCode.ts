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

/** Inclusive integer range `[min, max]`, descending (newest first). */
export function yearRangeInclusive(min: number, max: number): readonly number[] {
  if (min > max) return []
  const out: number[] = []
  for (let y = max; y >= min; y -= 1) out.push(y)
  return out
}

export const ACADEMIC_YEAR_MIN = 1999
export const ACADEMIC_YEAR_MAX = 2099

/** Academic years for UI pickers (newest first: 2099 … 1999). */
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

/**
 * Derives a short term code from a programme name and year.
 * Strips diacritics, skips stop words, takes the uppercase initial of each
 * remaining word, and caps the acronym at 6 characters.
 *
 * Result is a suggestion — always let the admin confirm or edit before saving.
 *
 * @example
 * buildTermCode('Gestalter für Visuelles Marketing', 2026)  → 'GVM-2026'
 * buildTermCode('Ausbildung zur Pflegefachkraft', 2025)      → 'Z-2025'  (zur/Ausbildung/Pflegefachkraft all filtered)
 */
export function buildTermCode(termName: string, year = new Date().getFullYear()): string {
  const words = termName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics (ü → u, ö → o, ä → a …)
    .replace(/[^a-zA-Z\s-]/g, ' ') // remove non-alpha chars
    .split(/[\s\-/]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !STOP_WORDS.has(w.toLowerCase()))

  const acronym = words
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
    .slice(0, 6) // max 6 chars to keep codes readable

  return acronym ? `${acronym}-${year}` : String(year)
}

/**
 * Suggested term code from a programme title and year.
 * Empty / whitespace title → `''` (avoids `buildTermCode('', y)` returning only a year).
 */
export function deriveSuggestedTermCode(
  programmeTitle: string | null | undefined,
  year: number,
): string {
  const name = programmeTitle?.trim() ?? ''
  return name.length > 0 ? buildTermCode(name, year) : ''
}

/**
 * Normalises a user-edited term code:
 * - uppercases everything
 * - strips characters that are not A-Z, 0-9, or hyphen
 * - collapses consecutive hyphens
 * - trims leading/trailing hyphens
 *
 * @example normalizeTermCode('gvm 2025') → 'GVM-2025'
 */
export function normalizeTermCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Valid term codes: 1–6 uppercase letters, a hyphen, then a 4-digit year.
 * @example 'GVM-2026' ✓   'A-2025' ✓   'TOOLONG-2026' ✗   'gvm-2026' ✗
 */
export const TERM_CODE_PATTERN = /^[A-Z]{1,6}-\d{4}$/

export function isValidTermCode(code: string): boolean {
  return TERM_CODE_PATTERN.test(code)
}

/**
 * Returns true when a term code matches the auto-derived `LETTERS-YEAR` pattern.
 * Used to decide whether to overwrite during auto-derivation without trampling
 * intentional manual edits.
 */
export function isAutoGeneratedTermCode(termCode: string): boolean {
  return TERM_CODE_PATTERN.test(termCode)
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
  return /^[A-Z]{1,6} (Jahrgang|Year) \d{4}$/.test(cohortName)
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
