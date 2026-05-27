import type { StepOperator } from '../../types/scoring.types'

function isRelatedOperator(a: StepOperator, b: StepOperator): boolean {
  return (a === 'Σ' && b === '+') || (a === '+' && b === 'Σ')
}

/**
 * Scores operator/method correctness for a single step.
 *
 * - `1` for exact operator match
 * - `0.5` for didactically related operators (`Σ` ↔ `+`)
 * - `0` otherwise or when the student operator is missing
 */
export function methodScore(
  studentOperator: StepOperator | undefined,
  expectedOperator: StepOperator,
): 0 | 0.5 | 1 {
  if (!studentOperator) return 0
  if (studentOperator === expectedOperator) return 1
  if (isRelatedOperator(studentOperator, expectedOperator)) return 0.5
  return 0
}
