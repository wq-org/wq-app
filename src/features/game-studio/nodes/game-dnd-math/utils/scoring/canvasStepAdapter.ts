import {
  isSigmaCanvasRow,
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
  type TokenCanvasRow,
} from '../../types/drag-drop-math.schema'
import type {
  StepNode,
  StepOperator,
  StudentStep,
  ToleranceWindow,
} from '../../types/scoring.types'
import { parseResultChipValue } from '../sigmaRow'
import { computeTolerance } from './toleranceWindow'

type CanvasScoringStep = {
  stepId: string
  rowId: string
  sourceTokenId: string
  value: number
  unit: string
  operator: StepOperator
}

function inferRowOperator(row: TokenCanvasRow): StepOperator {
  const equation = row.tokens.find(
    (token) =>
      token.variant === 'math' && token.mathRole !== 'equals' && token.mathRole !== 'result',
  )
  const raw = `${equation?.expression ?? ''} ${equation?.value ?? ''}`
  if (raw.includes('Σ')) return 'Σ'
  if (raw.includes('÷') || raw.includes('/')) return '÷'
  if (raw.includes('−') || raw.includes('-')) return '−'
  if (raw.includes('+')) return '+'
  return '×'
}

function parseTokenResult(
  row: TokenCanvasRow,
  token: DragDropMathCanvasToken,
): CanvasScoringStep | null {
  if (token.variant !== 'math' || token.mathRole !== 'result') return null
  const parsed = parseResultChipValue(token.value)
  if (!parsed) return null
  return {
    stepId: `row:${row.id}`,
    rowId: row.id,
    sourceTokenId: token.id,
    value: parsed.value,
    unit: parsed.displayUnit,
    operator: inferRowOperator(row),
  }
}

function parseSigmaStep(row: DragDropMathCanvasRow): CanvasScoringStep | null {
  if (!isSigmaCanvasRow(row) || !row.resultDisplay) return null
  const parsed = parseResultChipValue(row.resultDisplay)
  if (!parsed) return null
  return {
    stepId: `sigma:${row.id}`,
    rowId: row.id,
    sourceTokenId: row.resultTokenId,
    value: parsed.value,
    unit: parsed.displayUnit,
    operator: 'Σ',
  }
}

/** Committed result chips in canvas row order (equations, then sigma totals). */
export function extractCanvasScoringSteps(
  rows: readonly DragDropMathCanvasRow[],
): readonly CanvasScoringStep[] {
  const steps: CanvasScoringStep[] = []
  for (const row of rows) {
    const sigma = parseSigmaStep(row)
    if (sigma) {
      steps.push(sigma)
      continue
    }
    if (!isTokenCanvasRow(row)) continue
    for (const token of row.tokens) {
      const parsed = parseTokenResult(row, token)
      if (parsed) steps.push(parsed)
    }
  }
  return steps
}

function toStepNode(step: CanvasScoringStep): StepNode {
  return {
    id: step.stepId,
    operator: step.operator,
    operands: [step.value],
    expected: step.value,
    unit: step.unit,
    deps: [],
  }
}

function toStudentStep(teacherStepId: string, studentStep: CanvasScoringStep): StudentStep {
  return {
    nodeId: teacherStepId,
    operator: studentStep.operator,
    operands: [studentStep.value],
    actual: studentStep.value,
    unit: studentStep.unit,
    notation: { decimal: 'comma', rounded: false },
  }
}

export type CanvasStepTreeBuild = {
  tree: StepNode[]
  steps: readonly CanvasScoringStep[]
}

/**
 * Builds a PSCA step tree from all committed result chips on the teacher canvas.
 *
 * Returns `null` when no committed results exist.
 */
export function buildTeacherStepTree(
  teacherRows: readonly DragDropMathCanvasRow[],
): CanvasStepTreeBuild | null {
  const steps = extractCanvasScoringSteps(teacherRows)
  if (steps.length === 0) return null
  return {
    steps,
    tree: steps.map(toStepNode),
  }
}

export type CanvasStudentAnswersBuild = {
  answers: Record<string, StudentStep>
  steps: readonly CanvasScoringStep[]
  /** Maps each scored teacher step to the student token id that satisfied it. */
  studentTokenIdByStepId: Readonly<Record<string, string>>
}

function isValueWithinTolerance(
  studentValue: number,
  teacherValue: number,
  tolerance: ToleranceWindow,
): boolean {
  if (!Number.isFinite(studentValue) || !Number.isFinite(teacherValue)) return false
  const epsilon = computeTolerance(teacherValue, tolerance)
  return Math.abs(studentValue - teacherValue) <= epsilon
}

/**
 * Pairs each teacher step with at most one student step.
 *
 * Two passes:
 *   1. Exact match: same operator AND value within tolerance — handles reordered rows.
 *   2. Positional fallback: same index among still-unused student steps — handles wrong-value rows.
 *
 * Row IDs cannot be used because teacher and student canvases mint independent UUIDs.
 */
function alignStudentToTeacher(
  teacherSteps: readonly CanvasScoringStep[],
  studentSteps: readonly CanvasScoringStep[],
  tolerance: ToleranceWindow,
): Map<string, CanvasScoringStep> {
  const matches = new Map<string, CanvasScoringStep>()
  const usedStudentIdx = new Set<number>()

  teacherSteps.forEach((teacherStep) => {
    const exactIdx = studentSteps.findIndex(
      (studentStep, idx) =>
        !usedStudentIdx.has(idx) &&
        studentStep.operator === teacherStep.operator &&
        isValueWithinTolerance(studentStep.value, teacherStep.value, tolerance),
    )
    if (exactIdx >= 0) {
      matches.set(teacherStep.stepId, studentSteps[exactIdx])
      usedStudentIdx.add(exactIdx)
    }
  })

  teacherSteps.forEach((teacherStep, teacherIdx) => {
    if (matches.has(teacherStep.stepId)) return
    if (teacherIdx >= studentSteps.length) return
    if (usedStudentIdx.has(teacherIdx)) return
    matches.set(teacherStep.stepId, studentSteps[teacherIdx])
    usedStudentIdx.add(teacherIdx)
  })

  return matches
}

/**
 * Builds student answers aligned to the teacher step tree via value-aware bipartite matching.
 *
 * `tolerance` is consumed for the exact-match pass so values that round identically (e.g. 1.40 vs 1.4)
 * still align. It does not affect the positional fallback.
 */
export function buildStudentAnswers(
  studentRows: readonly DragDropMathCanvasRow[],
  teacherSteps: readonly CanvasScoringStep[],
  tolerance: ToleranceWindow,
): CanvasStudentAnswersBuild | null {
  if (teacherSteps.length === 0) return null

  const studentSteps = extractCanvasScoringSteps(studentRows)
  const matches = alignStudentToTeacher(teacherSteps, studentSteps, tolerance)

  const answers: Record<string, StudentStep> = {}
  const studentTokenIdByStepId: Record<string, string> = {}

  for (const teacherStep of teacherSteps) {
    const matched = matches.get(teacherStep.stepId)
    if (!matched) continue
    answers[teacherStep.stepId] = toStudentStep(teacherStep.stepId, matched)
    studentTokenIdByStepId[teacherStep.stepId] = matched.sourceTokenId
  }

  return {
    answers,
    steps: studentSteps,
    studentTokenIdByStepId,
  }
}

/** Token ids for canvas chips that failed step scoring (`s === 0`). */
export function resolveFailedStepTokenIds(
  perStep: ReadonlyArray<{ nodeId: string; s: number }>,
  studentTokenIdByStepId: Readonly<Record<string, string>>,
): string[] {
  const ids = new Set<string>()
  for (const step of perStep) {
    if (step.s !== 0) continue
    const tokenId = studentTokenIdByStepId[step.nodeId]
    if (tokenId) ids.add(tokenId)
  }
  return [...ids]
}
