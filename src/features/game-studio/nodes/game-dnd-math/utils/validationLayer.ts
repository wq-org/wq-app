/**
 * ValidationLayer — Layer 2 of unit-aware evaluation.
 *
 * Responsibility:
 *  - Receive the typed MathToken[] produced by tokenLayer.
 *  - Check token-sequence structure (no consecutive operators, balanced parens, …).
 *  - Track unit categories through the expression using ALLOWED_BINARY_RULES.
 *  - Block invalid unit combinations (e.g. length + mass).
 *  - Return the inferred result UnitCategory when the expression is valid.
 *
 * Pure functions only. No React, no side-effects.
 */

import { applyBinaryRule, type UnitCategory, type UnitDefinition } from './unitDefinitions'
import { isBlocked, syntheticDefinition, type LockedCombinationReason } from './lockedCombinations'
import {
  isNumberToken,
  isOperandToken,
  isOperatorToken,
  isParenToken,
  isUnitToken,
  type MathToken,
} from './tokenLayer'

// ─── Result types ─────────────────────────────────────────────────────────────

export type ValidationSuccess = {
  readonly ok: true
  /**
   * Inferred result unit category.
   * null when all operands are dimensionless numbers (no unit tokens present).
   */
  readonly resultCategory: UnitCategory | null
}

export type ValidationFailure = {
  readonly ok: false
  readonly reason: ValidationFailureReason
  /** Zero-based index of the first offending token, when applicable. */
  readonly tokenIndex?: number
  /**
   * Optional human-readable message for the failure. Populated when a locked
   * combination (e.g. `EUR + USD`) fires so the UI can show a specific German
   * explanation instead of the generic incompatible-units toast.
   */
  readonly message?: string
  /** Locked-combination reason when `reason === 'incompatible_units'` was triggered by a hard block. */
  readonly lockedReason?: LockedCombinationReason
}

export type ValidationResult = ValidationSuccess | ValidationFailure

export type ValidationFailureReason =
  | 'empty'
  | 'consecutive_operators'
  | 'consecutive_operands'
  | 'starts_with_operator'
  | 'ends_with_operator'
  | 'unbalanced_parens'
  | 'unknown_token'
  | 'incompatible_units'
  | 'division_by_zero_unit'

// ─── Structure check ─────────────────────────────────────────────────────────

function checkStructure(tokens: readonly MathToken[]): ValidationFailure | null {
  if (tokens.length === 0) {
    return { ok: false, reason: 'empty' }
  }

  let parenDepth = 0

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]

    if (token.kind === 'unknown') {
      return { ok: false, reason: 'unknown_token', tokenIndex: i }
    }

    if (isParenToken(token)) {
      if (token.symbol === '(') parenDepth += 1
      else {
        parenDepth -= 1
        if (parenDepth < 0) {
          return { ok: false, reason: 'unbalanced_parens', tokenIndex: i }
        }
      }
      continue
    }

    if (isOperatorToken(token)) {
      if (i === 0) {
        return { ok: false, reason: 'starts_with_operator', tokenIndex: i }
      }
      if (i === tokens.length - 1) {
        return { ok: false, reason: 'ends_with_operator', tokenIndex: i }
      }
      const prev = tokens[i - 1]
      if (isOperatorToken(prev)) {
        return { ok: false, reason: 'consecutive_operators', tokenIndex: i }
      }
      continue
    }

    if (isOperandToken(token)) {
      if (i > 0) {
        const prev = tokens[i - 1]
        if (isOperandToken(prev)) {
          // `8.50 €` — number with trailing unit badge (no operator between).
          if (isNumberToken(prev) && isUnitToken(token)) continue
          return { ok: false, reason: 'consecutive_operands', tokenIndex: i }
        }
      }
    }
  }

  if (parenDepth !== 0) {
    return { ok: false, reason: 'unbalanced_parens' }
  }

  return null
}

// ─── Unit inference ───────────────────────────────────────────────────────────

type FoldOperand = {
  readonly category: UnitCategory
  /** Real unit definition when the operand was a unit badge; null for dimensionless numbers. */
  readonly definition: UnitDefinition | null
  readonly tokenIndex: number
}

/** Infer the unit category of a single operand token. */
function operandCategory(token: MathToken): UnitCategory {
  if (isUnitToken(token)) return token.definition.category
  return 'dimensionless'
}

/**
 * Pick the definition to carry forward after applying a binary rule. We keep
 * the left operand's definition when the result stays in the left category
 * (e.g. `4 kg × 2 → 8 kg`), the right operand's definition when the result
 * matches the right side (e.g. `2 × 4 kg → 8 kg`), and drop the definition
 * when the result is a derived category (e.g. `length × length → area`).
 */
function carryDefinition(
  left: FoldOperand,
  right: FoldOperand,
  resultCategory: UnitCategory,
): UnitDefinition | null {
  if (left.definition && left.definition.category === resultCategory) return left.definition
  if (right.definition && right.definition.category === resultCategory) return right.definition
  return null
}

/** Synthetic stand-in so locked-combination rules can match dimensionless operands. */
function resolveDefinitionForBlockCheck(operand: FoldOperand): UnitDefinition {
  return operand.definition ?? syntheticDefinition(operand.category)
}

/**
 * Walk through a flat (non-parenthesised) token list left-to-right and
 * propagate unit categories through binary operations.
 *
 * Parentheses groups are resolved before binary propagation (see
 * `inferResultCategory` which handles the recursive case).
 *
 * Returns null when a rule violation is found.
 */
function inferFlat(
  tokens: readonly MathToken[],
): { category: UnitCategory; failIndex?: number } | { error: ValidationFailure } {
  // Collect operand + operator pairs in order.
  // Tokens are guaranteed structurally valid at this point.
  const operands: FoldOperand[] = []
  const operators: Array<{ op: string; tokenIndex: number }> = []

  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i]
    if (isParenToken(t)) continue
    if (isOperatorToken(t)) {
      operators.push({ op: t.op, tokenIndex: i })
      continue
    }
    const next = tokens[i + 1]
    if (isNumberToken(t) && next !== undefined && isUnitToken(next)) {
      operands.push({
        category: next.definition.category,
        definition: next.definition,
        tokenIndex: i,
      })
      i += 1
      continue
    }
    if (isOperandToken(t)) {
      operands.push({
        category: operandCategory(t),
        definition: isUnitToken(t) ? t.definition : null,
        tokenIndex: i,
      })
    }
  }

  if (operands.length === 0) {
    return { error: { ok: false, reason: 'empty' } }
  }

  // Fold left: apply each operator in sequence (ignores precedence — see note).
  // Full precedence parsing is the next planned step.
  let running: FoldOperand = operands[0]
  for (let i = 0; i < operators.length; i += 1) {
    const right = operands[i + 1]
    if (!right) break

    const op = operators[i].op as '+' | '-' | '*' | '/'

    // Hard block — supersedes ALLOWED_BINARY_RULES (e.g. EUR + USD, °C × 2).
    const leftDef = resolveDefinitionForBlockCheck(running)
    const rightDef = resolveDefinitionForBlockCheck(right)
    const locked = isBlocked(leftDef, op, rightDef)
    if (locked.blocked) {
      return {
        error: {
          ok: false,
          reason: 'incompatible_units',
          tokenIndex: operators[i].tokenIndex,
          message: locked.message,
          lockedReason: locked.reason,
        },
      }
    }

    const result = applyBinaryRule(running.category, op, right.category)
    if (result === null) {
      return {
        error: {
          ok: false,
          reason: 'incompatible_units',
          tokenIndex: operators[i].tokenIndex,
        },
      }
    }

    running = {
      category: result,
      definition: carryDefinition(running, right, result),
      tokenIndex: running.tokenIndex,
    }
  }

  return { category: running.category }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate a typed MathToken[] and return the inferred result UnitCategory.
 *
 * Phase 1: structural check (operators, parens, unknown tokens).
 * Phase 2: unit-category propagation via ALLOWED_BINARY_RULES.
 *
 * @example
 * const tokens = buildTokens(['15', '×', '€/Stück'])
 * validateTokens(tokens)
 * // → { ok: true, resultCategory: 'money' }
 *
 * @example
 * const tokens = buildTokens(['km', '+', 'kg'])
 * validateTokens(tokens)
 * // → { ok: false, reason: 'incompatible_units', tokenIndex: 1 }
 */
export function validateTokens(tokens: readonly MathToken[]): ValidationResult {
  // Phase 1: structure
  const structureError = checkStructure(tokens)
  if (structureError !== null) return structureError

  // Phase 2: unit inference (flat, left-to-right)
  const inferred = inferFlat(tokens)

  if ('error' in inferred) return inferred.error

  // When all operands are dimensionless, result is null (pure arithmetic).
  const hasUnit = tokens.some(isUnitToken)
  return {
    ok: true,
    resultCategory: hasUnit ? inferred.category : null,
  }
}

// ─── Convenience re-export ────────────────────────────────────────────────────

/**
 * Run both layers in one call: raw badge strings → ValidationResult.
 *
 * @example
 * validateBadges(['12', 'km', '/', '4', 'h'])
 * // → { ok: true, resultCategory: 'speed' }
 */
export { buildTokens } from './tokenLayer'
