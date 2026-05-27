/**
 * Partial Scoring Carry Algorithm (PSCA) — pure scoring entry point.
 *
 * Evaluates a multi-step math exercise as a weighted blend of four components on `[0, 1]`,
 * then maps to game points: `awardedPoints = score × pointsMax` (never above `pointsMax`).
 *
 * @see docs/architecture/principle_partial_scoring_carry_algorithm.md
 * @see docs/perplexity/task_drag_drop_math_psca_scoring.md
 *
 * ## Component letters (returned on {@link PscaResult})
 *
 * | Symbol | Config weight   | Meaning |
 * |--------|-----------------|--------|
 * | **R**  | `weights.result`    | **Result** — final answer vs teacher expected value (tolerance + optional graceful decay). |
 * | **S**  | `weights.steps`     | **Steps** — per-step numeric correctness after carry/strict operand resolution; averaged over all nodes. |
 * | **M**  | `weights.method`    | **Method** — operator choice per step (`×` vs `+`, etc.); `Σ` ↔ `+` counts as half credit. |
 * | **E**  | `weights.errorFree` | **Error-free** — notation/unit/concept hygiene per step (unit suffix, decimal style, sign plausibility). |
 *
 * Combined score:
 * `score = w_r·R + w_s·S + w_m·M + w_e·E` (weights must sum to `1`).
 *
 * ## Per-step breakdown (`perStep[]`, each row is one {@link StepNode})
 *
 * | Field | Letter | Meaning |
 * |-------|--------|--------|
 * | `m` | step **M** | Operator match for this step only (`0`, `0.5`, or `1`). |
 * | `s` | step **S** | `1` if `|student.actual − expectedCarry| ≤ ε`, else `0`. |
 * | `e` | step **E** | Average of unit / notation / concept subscores for this step. |
 * | `expectedCarry` | — | Teacher value recomputed from resolved operands in `config.mode`. |
 * | `actual` | — | Student committed numeric result for this step. |
 *
 * ## Scoring modes (`config.mode`, via {@link resolveOperands})
 *
 * - **`carry`** — follow-up steps use the student's prior step outputs (follow-up errors are not double-penalized).
 * - **`strict`** — operands always come from the model solution tree (each mistake propagates to later steps).
 *
 * ## Preview MVP vs full PSCA
 *
 * Drag-drop-math preview submit uses {@link R_ONLY_SCORING_CONFIG} (`result: 1`, others `0`): only **R** affects
 * `score` and `awardedPoints`. **S**, **M**, and **E** are still computed and returned for diagnostics / future UI.
 */

import type {
  PscaResult,
  ScoringConfig,
  StepBreakdown,
  StepNode,
  StepOperator,
  StudentStep,
} from '../../types/scoring.types'
import { resolveOperands } from './carryResolver'
import { errorFreeScore } from './errorFreeChecks'
import { methodScore } from './operatorMatch'
import { getFinalNode, topoSort, validateStepTree } from './stepTree'
import { computeTolerance } from './toleranceWindow'

/** Recomputes the teacher expected numeric result for a step from its operator and resolved operands. */
function computeByOperator(operator: StepOperator, operands: readonly number[]): number {
  if (operands.length === 0) return 0
  if (operator === 'Σ') return operands.reduce((sum, value) => sum + value, 0)
  if (operator === '+') return operands.reduce((sum, value) => sum + value, 0)
  if (operator === '×') return operands.reduce((product, value) => product * value, 1)
  if (operator === '−') {
    const [first, ...rest] = operands
    return rest.reduce((total, value) => total - value, first ?? 0)
  }
  const [first, ...rest] = operands
  return rest.reduce((total, value) => total / value, first ?? 0)
}

/**
 * Computes **R** (result component) for the final tree node.
 *
 * - `graceful: false` — binary: `1` inside tolerance, else `0`.
 * - `graceful: true` — linear partial credit: `1 − |Δ| / |expected|` (clamped at `0`).
 */
function computeResultScore(
  expectedFinal: number,
  actualFinal: number | undefined,
  tolerance: number,
  graceful: boolean,
): number {
  if (actualFinal === undefined || !Number.isFinite(actualFinal)) return 0
  const delta = Math.abs(actualFinal - expectedFinal)
  if (delta <= tolerance) return 1
  if (!graceful) return 0
  if (expectedFinal === 0) return 0
  return Math.max(0, 1 - delta / Math.abs(expectedFinal))
}

function assertWeights(weights: ScoringConfig['weights']): void {
  const sum = weights.result + weights.steps + weights.method + weights.errorFree
  if (Math.abs(sum - 1) >= 1e-9) {
    throw new Error('Weights must sum to 1')
  }
}

/** Per-step **S** score: `1` when the student's value matches the carry-resolved expectation within ε. */
function stepScore(actual: number, expectedCarry: number, epsilon: number): 0 | 1 {
  if (!Number.isFinite(actual)) return 0
  return Math.abs(actual - expectedCarry) <= epsilon ? 1 : 0
}

/**
 * Scores a drag-drop-math exercise using PSCA (Partial Scoring Carry Algorithm).
 *
 * @param tree - Teacher model solution as a DAG of {@link StepNode} (topologically sorted internally).
 * @param studentAnswers - Committed student values keyed by `nodeId` (from canvas adapter or full runtime).
 * @param config - Weights (`result` / `steps` / `method` / `errorFree`), `mode`, tolerance, `graceful`.
 * @param pointsMax - Game maximum points; `awardedPoints = score × pointsMax`, capped implicitly because `score ≤ 1`.
 *
 * @returns {@link PscaResult}
 * - `score` — weighted total in `[0, 1]`.
 * - `R`, `S`, `M`, `E` — component averages (see module doc table).
 * - `perStep` — per-node `m`, `s`, `e` plus `expectedCarry` / `actual` for debugging and error highlighting.
 * - `awardedPoints` — points shown in preview chat and the score ring.
 *
 * @example Preview MVP (R-only)
 * ```ts
 * pscaScore(tree, answers, R_ONLY_SCORING_CONFIG, 10)
 * // score === R; awardedPoints is 0 or 10 when the final result chip matches the teacher.
 * ```
 *
 * @example Full weights (authoring default)
 * ```ts
 * // score = 0.5·R + 0.3·S + 0.15·M + 0.05·E  (see DEFAULT_SCORING_CONFIG)
 * ```
 */
export function pscaScore(
  tree: readonly StepNode[],
  studentAnswers: Readonly<Record<string, StudentStep>>,
  config: ScoringConfig,
  pointsMax: number,
): PscaResult {
  assertWeights(config.weights)
  validateStepTree(tree)
  if (pointsMax < 0) throw new Error('pointsMax must be non-negative')

  const ordered = topoSort(tree)
  const perStep: StepBreakdown[] = []

  let sumM = 0
  let sumS = 0
  let sumE = 0

  for (const node of ordered) {
    const student = studentAnswers[node.id]
    const expectedCarry = computeByOperator(
      node.operator,
      resolveOperands(node, config.mode, ordered, studentAnswers),
    )
    const epsilon = computeTolerance(expectedCarry, config.tolerance)
    const m = methodScore(student?.operator, node.operator)
    const s = student ? stepScore(student.actual, expectedCarry, epsilon) : 0
    const e = errorFreeScore(student, node).average

    sumM += m
    sumS += s
    sumE += e

    perStep.push({
      nodeId: node.id,
      m,
      s,
      e,
      expectedCarry,
      actual: student?.actual ?? Number.NaN,
    })
  }

  const count = ordered.length
  const M = count > 0 ? sumM / count : 0
  const S = count > 0 ? sumS / count : 0
  const E = count > 0 ? sumE / count : 0

  const finalNode = getFinalNode(ordered)
  const finalStudent = studentAnswers[finalNode.id]
  const finalTolerance = computeTolerance(finalNode.expected, config.tolerance)
  const R = computeResultScore(
    finalNode.expected,
    finalStudent?.actual,
    finalTolerance,
    config.graceful,
  )

  const score =
    config.weights.result * R +
    config.weights.steps * S +
    config.weights.method * M +
    config.weights.errorFree * E

  return {
    score,
    R,
    S,
    M,
    E,
    perStep,
    awardedPoints: score * pointsMax,
  }
}
