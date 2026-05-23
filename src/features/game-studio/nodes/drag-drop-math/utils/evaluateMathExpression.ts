import { evaluate } from 'mathjs'

import {
  containsCurrency,
  formatPrettyMathExpression,
  hasUnknownMathTokens,
  toMathExpr,
  tokenizeMathInput,
} from './mathExpressionTokens'

export type MathExpressionEvaluateSuccess = {
  ok: true
  expression: string
  result: number
  display: string
}

export type MathExpressionEvaluateFailure = {
  ok: false
  reason: 'empty' | 'invalid_characters' | 'parse_error' | 'not_finite'
}

export type MathExpressionEvaluateResult =
  | MathExpressionEvaluateSuccess
  | MathExpressionEvaluateFailure

const LETTER_PATTERN = /[a-zA-ZÀ-ÿ]/
const MATHJS_EXPRESSION_PATTERN = /^[0-9+\-*/().\s]+$/

function normalizeExpressionInput(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatMathResult(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('formatMathResult expects a finite number')
  }

  const rounded = Math.round(value * 1e10) / 1e10
  if (Object.is(rounded, -0)) return '0'
  if (Number.isInteger(rounded)) return String(rounded)
  return String(rounded)
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export function evaluateMathExpression(raw: string): MathExpressionEvaluateResult {
  const trimmed = normalizeExpressionInput(raw)
  if (trimmed.length === 0) {
    return { ok: false, reason: 'empty' }
  }

  if (LETTER_PATTERN.test(trimmed)) {
    return { ok: false, reason: 'invalid_characters' }
  }

  const tokens = tokenizeMathInput(trimmed)

  if (containsCurrency(tokens) || hasUnknownMathTokens(tokens)) {
    return { ok: false, reason: 'invalid_characters' }
  }

  const prettyExpression = formatPrettyMathExpression(tokens)
  const mathExpression = toMathExpr(tokens)

  if (mathExpression.length === 0 || !MATHJS_EXPRESSION_PATTERN.test(mathExpression)) {
    return { ok: false, reason: 'invalid_characters' }
  }

  let evaluated: unknown
  try {
    evaluated = evaluate(mathExpression)
  } catch {
    return { ok: false, reason: 'parse_error' }
  }

  const result = toFiniteNumber(evaluated)
  if (result === null) {
    return { ok: false, reason: 'not_finite' }
  }

  return {
    ok: true,
    expression: prettyExpression,
    result,
    display: formatMathResult(result),
  }
}
