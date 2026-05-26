import { findUnitDefinition, UNIT_DEFINITIONS, type UnitCategory } from './unitDefinitions'

/** Maps display/badge glyphs to mathjs-safe tokens (per-token). */
export const MATH_BADGE_MAP: Record<string, string> = {
  '€': '',
  ',': '.',
  '·': '*',
  '×': '*',
  '÷': '/',
  '−': '-',
}

const CURRENCY_SYMBOLS = new Set(['€', '$', '£', '¥'])
const MULTI_CHAR_OPS = ['×', '÷', '·', '−'] as const
const SINGLE_CHAR_TOKENS = new Set(['+', '-', '*', '/', '(', ')', '.', ',', '€', '$', '£', '¥'])

const NUMBER_TOKEN_PATTERN = /^\d+(?:[.,]\d+)?$/

const DISPLAY_OPERATOR_MAP: Record<string, string> = {
  '*': '×',
  '/': '÷',
  '-': '−',
}

let sortedUnitLookupKeys: string[] | null = null

function getSortedUnitLookupKeys(): string[] {
  if (sortedUnitLookupKeys !== null) return sortedUnitLookupKeys

  const keys = new Set<string>()
  for (const def of UNIT_DEFINITIONS) {
    keys.add(def.symbol)
    keys.add(def.displaySymbol)
    for (const alias of def.aliases ?? []) keys.add(alias)
  }
  sortedUnitLookupKeys = [...keys].sort((a, b) => b.length - a.length)
  return sortedUnitLookupKeys
}

function tryMatchUnitAt(raw: string, index: number): string | null {
  for (const key of getSortedUnitLookupKeys()) {
    if (raw.startsWith(key, index)) return key
  }
  return null
}

/** Peels one or more registry units glued directly after a number (e.g. `11h`, `25.5kW`, `8.50€/kg`). */
function peelGluedUnitsAfterNumber(
  raw: string,
  index: number,
): { units: string[]; nextIndex: number } {
  const units: string[] = []
  let cursor = index

  while (cursor < raw.length) {
    const unit = tryMatchUnitAt(raw, cursor)
    if (!unit) break
    units.push(unit)
    cursor += unit.length
  }

  if (units.length > 0) {
    return { units, nextIndex: cursor }
  }

  if (cursor < raw.length && CURRENCY_SYMBOLS.has(raw[cursor]!)) {
    units.push(raw[cursor]!)
    return { units, nextIndex: cursor + 1 }
  }

  return { units, nextIndex: cursor }
}

/**
 * Splits tokens like `11h` or `280.5kWh` when they were not split during the main scan.
 */
function splitGluedNumberUnitToken(token: string): string[] | null {
  const match = token.match(/^(\d+(?:[.,]\d+)?)(.+)$/)
  if (!match) return null

  const [, numberPart, suffix] = match
  const unit = tryMatchUnitAt(suffix, 0)
  if (!unit || unit.length !== suffix.length) return null

  return [numberPart, unit]
}

function expandGluedOperandTokens(tokens: string[]): string[] {
  const expanded: string[] = []

  for (const token of tokens) {
    const split = splitGluedNumberUnitToken(token)
    if (split) {
      expanded.push(...split)
      continue
    }
    expanded.push(token)
  }

  return expanded
}

function mapTokenForEval(token: string): string {
  if (token in MATH_BADGE_MAP) return MATH_BADGE_MAP[token]
  if (findUnitDefinition(token) !== null) return ''
  if (/^\d+,\d+$/.test(token)) return token.replace(',', '.')
  return token
}

/** Turns canvas/display tokens into a spaced expression for `mathjs.evaluate`. */
export function toMathExpr(tokens: readonly string[]): string {
  return tokens
    .map(mapTokenForEval)
    .filter((token) => token !== '')
    .join(' ')
}

/**
 * Tokenize typed equation input (registry-aware).
 * Supports glued forms like `8.5€`, `11h`, `25.5kW`, `EUR/kg`, `40*8.5€`.
 */
export function tokenizeEquationInput(raw: string): string[] {
  const normalized = raw.replace(/\u00a0/g, ' ').trim()
  const tokens: string[] = []
  let index = 0

  while (index < normalized.length) {
    const char = normalized[index]
    if (/\s/.test(char)) {
      index += 1
      continue
    }

    if (/\d/.test(char)) {
      let end = index + 1
      while (end < normalized.length && /\d/.test(normalized[end])) {
        end += 1
      }
      const separator = normalized[end]
      if (
        (separator === ',' || separator === '.') &&
        end + 1 < normalized.length &&
        /\d/.test(normalized[end + 1])
      ) {
        end += 1
        while (end < normalized.length && /\d/.test(normalized[end])) {
          end += 1
        }
      }
      tokens.push(normalized.slice(index, end))
      index = end

      const { units: gluedUnits, nextIndex } = peelGluedUnitsAfterNumber(normalized, index)
      for (const unit of gluedUnits) tokens.push(unit)
      index = nextIndex
      continue
    }

    const multiCharOp = MULTI_CHAR_OPS.find((op) => normalized.startsWith(op, index))
    if (multiCharOp) {
      tokens.push(multiCharOp)
      index += multiCharOp.length
      continue
    }

    const unitMatch = tryMatchUnitAt(normalized, index)
    if (unitMatch) {
      tokens.push(unitMatch)
      index += unitMatch.length
      continue
    }

    if (SINGLE_CHAR_TOKENS.has(char)) {
      tokens.push(char)
      index += 1
      continue
    }

    tokens.push(char)
    index += 1
  }

  return expandGluedOperandTokens(tokens)
}

/** @deprecated Prefer {@link tokenizeEquationInput} for typed equations with units. */
export function tokenizeMathInput(raw: string): string[] {
  return tokenizeEquationInput(raw)
}

export function containsCurrency(tokens: readonly string[]): boolean {
  return tokens.some((token) => CURRENCY_SYMBOLS.has(token))
}

export function isKnownMathToken(token: string): boolean {
  if (NUMBER_TOKEN_PATTERN.test(token)) return true
  if (SINGLE_CHAR_TOKENS.has(token)) return true
  if ((MULTI_CHAR_OPS as readonly string[]).includes(token)) return true
  if (findUnitDefinition(token) !== null) return true
  return false
}

export function hasUnknownMathTokens(tokens: readonly string[]): boolean {
  return tokens.some((token) => !isKnownMathToken(token))
}

/** Pretty display after Enter — maps registry tokens to `displaySymbol`. */
export function formatDisplayEquation(raw: string): string {
  const tokens = tokenizeEquationInput(raw)
  const parts = tokens.map((token) => {
    const def = findUnitDefinition(token)
    if (def) return def.displaySymbol
    if (token in DISPLAY_OPERATOR_MAP) return DISPLAY_OPERATOR_MAP[token]
    return token
  })

  return parts.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')').trim()
}

/** Legacy pretty formatter (strips €). Prefer {@link formatDisplayEquation}. */
export function formatPrettyMathExpression(tokens: readonly string[]): string {
  const visible = tokens.filter((token) => token !== '€' && token !== '')
  const spaced = visible.join(' ')
  return spaced.replace(/\( /g, '(').replace(/ \)/g, ')').trim()
}

/**
 * Default result unit glyph per inferred category (classroom DE conventions).
 * Money and derived compound units use registry display symbols.
 */
const RESULT_SUFFIX_BY_CATEGORY: Readonly<Partial<Record<UnitCategory, string>>> = {
  money: ' €',
  percentage: ' %',
  length: ' m',
  area: ' m²',
  volume: ' m³',
  capacity: ' l',
  mass: ' kg',
  time: ' h',
  energy: ' kWh',
  power: ' kW',
  speed: ' km/h',
  count: ' Stück',
  density: ' kg/m³',
}

export function resolveResultDisplaySuffix(resultCategory: UnitCategory | null): string {
  if (resultCategory === null) return ''
  return RESULT_SUFFIX_BY_CATEGORY[resultCategory] ?? ''
}
