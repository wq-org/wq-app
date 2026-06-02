import type { ScoringMode, StepNode, StepOperand, StudentStep } from '../../types/scoring.types'

function resolveOperandValue(
  operand: StepOperand,
  mode: ScoringMode,
  expectedById: ReadonlyMap<string, StepNode>,
  studentAnswers: Readonly<Record<string, StudentStep>>,
): number {
  if (typeof operand === 'number') return operand
  const refNode = expectedById.get(operand.ref)
  if (!refNode) return 0
  if (mode === 'strict') return refNode.expected
  const student = studentAnswers[operand.ref]
  return student ? student.actual : refNode.expected
}

/**
 * Resolves a step's operand values according to scoring mode.
 *
 * - `carry`: use upstream student actuals when available
 * - `strict`: always use model expected values for refs
 */
export function resolveOperands(
  node: StepNode,
  mode: ScoringMode,
  tree: readonly StepNode[],
  studentAnswers: Readonly<Record<string, StudentStep>>,
): number[] {
  const expectedById = new Map(tree.map((item) => [item.id, item] as const))
  return node.operands.map((operand) =>
    resolveOperandValue(operand, mode, expectedById, studentAnswers),
  )
}
