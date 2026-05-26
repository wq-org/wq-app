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

function mapTokenForEval(token: string): string {
  if (token in MATH_BADGE_MAP) return MATH_BADGE_MAP[token]
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
 * Supports glued forms like `8.5€`, `EUR/kg`, `40*8.5€`.
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

      const gluedCurrency = normalized[index]
      if (gluedCurrency && CURRENCY_SYMBOLS.has(gluedCurrency)) {
        tokens.push(gluedCurrency)
        index += 1
      } else {
        const gluedUnit = tryMatchUnitAt(normalized, index)
        if (gluedUnit) {
          tokens.push(gluedUnit)
          index += gluedUnit.length
        }
      }
      continue
    }

    const multiCharOp = MULTI_CHAR_OPS.find((op) => normalized.startsWith(op, index))
    if (multiCharOp) {
      tokens.push(multiCharOp)
      index += multiCharOp.length
      continue
    }

    if (SINGLE_CHAR_TOKENS.has(char)) {
      tokens.push(char)
      index += 1
      continue
    }

    const unitMatch = tryMatchUnitAt(normalized, index)
    if (unitMatch) {
      tokens.push(unitMatch)
      index += unitMatch.length
      continue
    }

    tokens.push(char)
    index += 1
  }

  return tokens
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

export function resolveResultDisplaySuffix(resultCategory: UnitCategory | null): string {
  if (resultCategory === 'money') return ' €'
  if (resultCategory === 'percentage') return ' %'
  return ''
}
