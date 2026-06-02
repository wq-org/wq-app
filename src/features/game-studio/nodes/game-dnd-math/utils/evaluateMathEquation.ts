/**
 * Equation evaluation pipeline — TokenLayer → ValidationLayer → mathjs.
 *
 * Used on Enter before commit so instant color feedback matches the same rules
 * as persisted row state.
 */

import { buildTokens } from './tokenLayer'
import { validateTokens } from './validationLayer'
import {
  type MathExpressionEvaluateFailure,
  type MathExpressionEvaluateResult,
} from './evaluateMathExpression'
import { formatGroupedNumber } from './numberDisplay'
import {
  formatDisplayEquation,
  resolveResultDisplaySuffix,
  toMathExpr,
  tokenizeEquationInput,
} from './mathExpressionTokens'
import { mathEvaluate } from './mathInstance'
import type { ValidationFailureReason } from './validationLayer'

const MATHJS_EXPRESSION_PATTERN = /^[0-9+\-*/().\s]+$/

function mapValidationReason(
  reason: ValidationFailureReason,
): MathExpressionEvaluateFailure['reason'] {
  if (reason === 'empty') return 'empty'
  if (reason === 'incompatible_units') return 'incompatible_units'
  return 'invalid_characters'
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

/**
 * Validates unit tokens, then evaluates the numeric skeleton (units stripped for mathjs).
 * Typed input like `40 * 8.5€` is normalized to display symbols on commit (e.g. `40 × 8.50 €`).
 */
export function evaluateMathEquation(raw: string): MathExpressionEvaluateResult {
  const stringTokens = tokenizeEquationInput(raw)
  const tokens = buildTokens(stringTokens)
  const validation = validateTokens(tokens)

  if (!validation.ok) {
    return {
      ok: false,
      reason: mapValidationReason(validation.reason),
      ...(validation.message ? { message: validation.message } : {}),
    }
  }

  const prettyExpression = formatDisplayEquation(raw)
  const mathExpression = toMathExpr(stringTokens)

  if (mathExpression.length === 0 || !MATHJS_EXPRESSION_PATTERN.test(mathExpression)) {
    return { ok: false, reason: 'invalid_characters' }
  }

  let evaluated: unknown
  try {
    evaluated = mathEvaluate(mathExpression)
  } catch {
    return { ok: false, reason: 'parse_error' }
  }

  const result = toFiniteNumber(evaluated)
  if (result === null) {
    return { ok: false, reason: 'not_finite' }
  }

  const numericDisplay = formatGroupedNumber(result)
  const suffix = resolveResultDisplaySuffix(validation.resultCategory, stringTokens)

  return {
    ok: true,
    expression: prettyExpression,
    result,
    display: `${numericDisplay}${suffix}`.trim(),
  }
}
