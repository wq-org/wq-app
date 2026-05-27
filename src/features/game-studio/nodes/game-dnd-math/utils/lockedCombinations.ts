/**
 * LockedCombinations — Hard blocks layered ON TOP of `ALLOWED_BINARY_RULES`.
 *
 * Why:
 *  - `applyBinaryRule()` treats same-category additive ops as allowed by
 *    default (`a + a → a`). That implicitly permits e.g. `EUR + USD` because
 *    both share `category: 'money'`. We need a hard block on mixed currency
 *    while keeping `ct + EUR` allowed (same `baseSymbol: 'EUR'`).
 *  - "Strict school mode" should also reject semantically wrong arithmetic
 *    even when categories look compatible — e.g. `EUR × EUR`, `°C × 2`,
 *    `m + m²`, `kg + l`, … with explicit German error messages.
 *
 * Usage:
 *   Call `isBlocked(leftDef, operator, rightDef)` BEFORE `applyBinaryRule()`.
 *   When `blocked === true`, surface the German `message` as the validation
 *   failure description instead of the generic "incompatible units" toast.
 *
 * Pure functions only. No React, no side effects.
 */

import type { BinaryOperator, UnitCategory, UnitDefinition } from './unitDefinitions'

// ─── Public types ────────────────────────────────────────────────────────────

export type LockedCombinationReason =
  | 'mixed_currency_add_sub'
  | 'money_money_mul_div'
  | 'temperature_arithmetic'
  | 'length_area_add_sub'
  | 'length_volume_add_sub'
  | 'area_volume_add_sub'
  | 'mass_capacity_add_sub'
  | 'money_quantity_add_sub'
  | 'money_energy_add_sub'
  | 'time_mass_add_sub'
  | 'rate_add_sub_mismatch'

export type LockedCombinationMatch = {
  readonly blocked: true
  readonly reason: LockedCombinationReason
  readonly message: string
}

export type NotLockedCombinationMatch = {
  readonly blocked: false
}

export type LockedCombinationResult = LockedCombinationMatch | NotLockedCombinationMatch

// ─── Internal rule shape ─────────────────────────────────────────────────────

type LockedCombinationRule = {
  readonly reason: LockedCombinationReason
  readonly operators: readonly BinaryOperator[]
  readonly leftCategory?: UnitCategory
  readonly rightCategory?: UnitCategory
  /** When true, the rule matches both (left, right) and (right, left) orderings. */
  readonly symmetric?: boolean
  readonly when?: (left: UnitDefinition, operator: BinaryOperator, right: UnitDefinition) => boolean
  readonly message:
    | string
    | ((left: UnitDefinition, operator: BinaryOperator, right: UnitDefinition) => string)
}

// ─── Operator groupings ──────────────────────────────────────────────────────

const ADD_SUB: readonly BinaryOperator[] = ['+', '-']
const MUL_DIV: readonly BinaryOperator[] = ['*', '/']
const ALL_ARITHMETIC: readonly BinaryOperator[] = ['+', '-', '*', '/']

const MONEY_QUANTITY_CATEGORIES: readonly UnitCategory[] = [
  'length',
  'area',
  'volume',
  'capacity',
  'mass',
  'time',
  'count',
]

// ─── Rule helpers ────────────────────────────────────────────────────────────

function resolveMessage(
  rule: LockedCombinationRule,
  left: UnitDefinition,
  operator: BinaryOperator,
  right: UnitDefinition,
): string {
  return typeof rule.message === 'function' ? rule.message(left, operator, right) : rule.message
}

function categoriesMatch(
  rule: LockedCombinationRule,
  left: UnitDefinition,
  right: UnitDefinition,
): boolean {
  if (rule.leftCategory === undefined && rule.rightCategory === undefined) {
    return true
  }

  if (rule.symmetric) {
    const direct =
      (rule.leftCategory === undefined || left.category === rule.leftCategory) &&
      (rule.rightCategory === undefined || right.category === rule.rightCategory)

    const reverse =
      (rule.leftCategory === undefined || right.category === rule.leftCategory) &&
      (rule.rightCategory === undefined || left.category === rule.rightCategory)

    return direct || reverse
  }

  return (
    (rule.leftCategory === undefined || left.category === rule.leftCategory) &&
    (rule.rightCategory === undefined || right.category === rule.rightCategory)
  )
}

// ─── Rule set ────────────────────────────────────────────────────────────────

/**
 * Hard blocks that override `ALLOWED_BINARY_RULES`.
 *
 * Order matters only for reporting: the first matching rule wins, so the most
 * specific reasons (e.g. currency mismatch) appear before broader fallbacks
 * (e.g. money × quantity).
 */
export const LOCKED_COMBINATIONS: readonly LockedCombinationRule[] = [
  {
    reason: 'mixed_currency_add_sub',
    operators: ADD_SUB,
    leftCategory: 'money',
    rightCategory: 'money',
    when: (left, _op, right) => left.baseSymbol !== right.baseSymbol,
    message: (left, _op, right) =>
      `${left.displaySymbol} und ${right.displaySymbol} dürfen nicht direkt addiert oder subtrahiert werden. Erst in dieselbe Währung umrechnen.`,
  },

  {
    reason: 'money_money_mul_div',
    operators: MUL_DIV,
    leftCategory: 'money',
    rightCategory: 'money',
    message: 'Geld mit Geld darf im Schulmodus nicht multipliziert oder dividiert werden.',
  },

  {
    reason: 'temperature_arithmetic',
    operators: ALL_ARITHMETIC,
    leftCategory: 'temperature',
    symmetric: true,
    message:
      'Temperaturen (°C / K) sind im Schulmodus arithmetisch gesperrt. Bitte nur explizit erlaubte Temperatur-Regeln separat modellieren.',
  },

  {
    reason: 'length_area_add_sub',
    operators: ADD_SUB,
    leftCategory: 'length',
    rightCategory: 'area',
    symmetric: true,
    message: 'Länge und Fläche dürfen nicht addiert oder subtrahiert werden.',
  },

  {
    reason: 'length_volume_add_sub',
    operators: ADD_SUB,
    leftCategory: 'length',
    rightCategory: 'volume',
    symmetric: true,
    message: 'Länge und Volumen dürfen nicht addiert oder subtrahiert werden.',
  },

  {
    reason: 'area_volume_add_sub',
    operators: ADD_SUB,
    leftCategory: 'area',
    rightCategory: 'volume',
    symmetric: true,
    message: 'Fläche und Volumen dürfen nicht addiert oder subtrahiert werden.',
  },

  {
    reason: 'mass_capacity_add_sub',
    operators: ADD_SUB,
    leftCategory: 'mass',
    rightCategory: 'capacity',
    symmetric: true,
    message: 'Masse und Flüssigkeitsmenge dürfen nicht addiert oder subtrahiert werden.',
  },

  {
    reason: 'time_mass_add_sub',
    operators: ADD_SUB,
    leftCategory: 'time',
    rightCategory: 'mass',
    symmetric: true,
    message: 'Zeit und Masse dürfen nicht addiert oder subtrahiert werden.',
  },

  {
    reason: 'money_energy_add_sub',
    operators: ADD_SUB,
    leftCategory: 'money',
    rightCategory: 'energy',
    symmetric: true,
    message: 'Geld und Energie dürfen nicht addiert oder subtrahiert werden.',
  },

  {
    reason: 'money_quantity_add_sub',
    operators: ADD_SUB,
    when: (left, _op, right) =>
      (left.category === 'money' && MONEY_QUANTITY_CATEGORIES.includes(right.category)) ||
      (right.category === 'money' && MONEY_QUANTITY_CATEGORIES.includes(left.category)),
    message:
      'Geld darf nicht direkt mit Menge, Länge, Fläche, Volumen, Masse, Zeit oder Stückzahl addiert oder subtrahiert werden.',
  },

  {
    reason: 'rate_add_sub_mismatch',
    operators: ADD_SUB,
    leftCategory: 'rate',
    rightCategory: 'rate',
    when: (left, _op, right) => left.baseSymbol !== right.baseSymbol,
    message: (left, _op, right) =>
      `${left.displaySymbol} und ${right.displaySymbol} sind unterschiedliche Preisraten und dürfen nicht direkt addiert oder subtrahiert werden.`,
  },
]

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns an explicit hard-block match. Call BEFORE `applyBinaryRule()`.
 *
 * @example
 * isBlocked(eur, '+', usd) // → { blocked: true, reason: 'mixed_currency_add_sub', message: '€ und $ …' }
 * isBlocked(eur, '+', ct)  // → { blocked: false } — same baseSymbol 'EUR'
 */
export function isBlocked(
  left: UnitDefinition,
  operator: BinaryOperator,
  right: UnitDefinition,
): LockedCombinationResult {
  for (const rule of LOCKED_COMBINATIONS) {
    if (!rule.operators.includes(operator)) continue
    if (!categoriesMatch(rule, left, right)) continue
    if (rule.when && !rule.when(left, operator, right)) continue

    return {
      blocked: true,
      reason: rule.reason,
      message: resolveMessage(rule, left, operator, right),
    }
  }

  return { blocked: false }
}

/**
 * Convenience helper when only categories are known.
 * Prefer {@link isBlocked} with full `UnitDefinition` whenever possible —
 * currency and rate checks depend on `baseSymbol`, which a category alone
 * cannot disambiguate (EUR vs USD both have `category: 'money'`).
 */
export function isBlockedByCategory(
  leftCategory: UnitCategory,
  operator: BinaryOperator,
  rightCategory: UnitCategory,
): LockedCombinationResult {
  return isBlocked(syntheticDefinition(leftCategory), operator, syntheticDefinition(rightCategory))
}

/**
 * Build a placeholder `UnitDefinition` for category-only checks. Exposed so
 * the validation layer can mix real definitions with synthetic dimensionless
 * stand-ins when one operand has no concrete unit (e.g. `20 °C × 2`).
 */
export function syntheticDefinition(category: UnitCategory): UnitDefinition {
  return {
    symbol: category,
    category,
    baseSymbol: category,
    displaySymbol: category,
  }
}

// ─── Tiny semantic helpers (handy for tests / call sites) ────────────────────

export function isMixedCurrency(left: UnitDefinition, right: UnitDefinition): boolean {
  return (
    left.category === 'money' && right.category === 'money' && left.baseSymbol !== right.baseSymbol
  )
}

export function isTemperatureUnit(unit: UnitDefinition): boolean {
  return unit.category === 'temperature'
}

export function isAddSub(operator: BinaryOperator): boolean {
  return operator === '+' || operator === '-'
}
