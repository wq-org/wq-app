/**
 * TokenLayer — Layer 1 of unit-aware evaluation.
 *
 * Responsibility:
 *  - Accept raw badge strings (the individual chips on the canvas row).
 *  - Normalize symbol aliases to canonical forms (× → *, ÷ → /, € → EUR, …).
 *  - Classify each badge as number | operator | paren | unit | unknown.
 *
 * Pure functions only. No React, no side-effects, no Supabase.
 */

import {
  findUnitDefinition,
  isBinaryOperator,
  type BinaryOperator,
  type UnitDefinition,
} from './unitDefinitions'

// ─── Token types ─────────────────────────────────────────────────────────────

export type NumberToken = {
  readonly kind: 'number'
  /** Original raw string (may use comma as decimal separator). */
  readonly raw: string
  /** Parsed JS number value. */
  readonly value: number
}

export type OperatorToken = {
  readonly kind: 'operator'
  /** Normalized operator character. */
  readonly op: BinaryOperator
  /** Original glyph entered by user (e.g. '×'). */
  readonly raw: string
}

export type ParenToken = {
  readonly kind: 'paren'
  readonly symbol: '(' | ')'
}

export type UnitToken = {
  readonly kind: 'unit'
  /** Normalized canonical symbol (e.g. 'EUR' for '€'). */
  readonly symbol: string
  /** Original raw badge string. */
  readonly raw: string
  readonly definition: UnitDefinition
}

export type UnknownToken = {
  readonly kind: 'unknown'
  readonly raw: string
}

export type MathToken = NumberToken | OperatorToken | ParenToken | UnitToken | UnknownToken

// ─── Symbol normalization map ─────────────────────────────────────────────────

/**
 * Maps display glyphs to the canonical operator character they represent.
 * Keys here are NOT operators in the mathjs sense — they are visual aliases only.
 */
const OPERATOR_ALIASES: ReadonlyMap<string, BinaryOperator> = new Map([
  ['×', '*'],
  ['·', '*'],
  ['÷', '/'],
  ['−', '-'],
])

/** Best-effort decimal normalization ('3,14' → 3.14). */
function parseNumber(raw: string): number | null {
  const normalized = raw.replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

const NUMBER_PATTERN = /^\d+([.,]\d+)?$/

// ─── Core classification ──────────────────────────────────────────────────────

/**
 * Classify a single raw badge string into a typed MathToken.
 *
 * Order of checks (first match wins):
 *  1. Paren
 *  2. Operator alias → normalized operator
 *  3. Single-char standard operator
 *  4. Number (digits, optional decimal comma/dot)
 *  5. Unit lookup (with superscript normalization)
 *  6. Unknown
 */
export function classifyBadge(raw: string): MathToken {
  const trimmed = raw.trim()
  if (trimmed.length === 0) return { kind: 'unknown', raw }

  // paren
  if (trimmed === '(') return { kind: 'paren', symbol: '(' }
  if (trimmed === ')') return { kind: 'paren', symbol: ')' }

  // operator alias (× ÷ · −)
  const aliasOp = OPERATOR_ALIASES.get(trimmed)
  if (aliasOp !== undefined) return { kind: 'operator', op: aliasOp, raw: trimmed }

  // standard operator chars
  if (isBinaryOperator(trimmed)) return { kind: 'operator', op: trimmed, raw: trimmed }

  // number
  if (NUMBER_PATTERN.test(trimmed)) {
    const value = parseNumber(trimmed)
    if (value !== null) return { kind: 'number', raw: trimmed, value }
  }

  const unitDef = findUnitDefinition(trimmed)
  if (unitDef !== null) {
    return {
      kind: 'unit',
      symbol: unitDef.symbol,
      raw: trimmed,
      definition: unitDef,
    }
  }

  return { kind: 'unknown', raw: trimmed }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a typed token list from an array of raw badge strings.
 *
 * @example
 * buildTokens(['15', '×', '8.50', '€/Stück'])
 * // → [number(15), operator(*), number(8.5), unit(EUR/Stueck)]
 */
export function buildTokens(badges: readonly string[]): readonly MathToken[] {
  return badges.map(classifyBadge)
}

// ─── Helpers (exported for use in ValidationLayer) ────────────────────────────

export function isNumberToken(t: MathToken): t is NumberToken {
  return t.kind === 'number'
}

export function isOperatorToken(t: MathToken): t is OperatorToken {
  return t.kind === 'operator'
}

export function isParenToken(t: MathToken): t is ParenToken {
  return t.kind === 'paren'
}

export function isUnitToken(t: MathToken): t is UnitToken {
  return t.kind === 'unit'
}

export function isUnknownToken(t: MathToken): t is UnknownToken {
  return t.kind === 'unknown'
}

/** True when a token can act as an operand (number or unit). */
export function isOperandToken(t: MathToken): t is NumberToken | UnitToken {
  return t.kind === 'number' || t.kind === 'unit'
}
