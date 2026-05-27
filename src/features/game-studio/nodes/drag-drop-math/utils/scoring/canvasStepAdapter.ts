import {
  isSigmaCanvasRow,
  isTokenCanvasRow,
  type DragDropMathCanvasRow,
  type DragDropMathCanvasToken,
} from '../../types/drag-drop-math.schema'
import type { StepNode, StudentStep } from '../../types/scoring.types'
import { parseResultChipValue } from '../sigmaRow'

type ExtractedFinalStep = {
  readonly value: number
  readonly unit: string
  readonly sourceTokenId: string
  readonly operator: 'Σ'
}

function parseTokenResult(token: DragDropMathCanvasToken): ExtractedFinalStep | null {
  if (token.variant !== 'math' || token.mathRole !== 'result') return null
  const parsed = parseResultChipValue(token.value)
  if (!parsed) return null
  return {
    value: parsed.value,
    unit: parsed.displayUnit,
    sourceTokenId: token.id,
    operator: 'Σ',
  }
}

function parseSigmaResult(row: DragDropMathCanvasRow): ExtractedFinalStep | null {
  if (!isSigmaCanvasRow(row) || !row.resultDisplay) return null
  const parsed = parseResultChipValue(row.resultDisplay)
  if (!parsed) return null
  return {
    value: parsed.value,
    unit: parsed.displayUnit,
    sourceTokenId: row.resultTokenId,
    operator: 'Σ',
  }
}

function extractLastCommittedFinal(
  rows: readonly DragDropMathCanvasRow[],
): ExtractedFinalStep | null {
  let last: ExtractedFinalStep | null = null
  for (const row of rows) {
    const sigma = parseSigmaResult(row)
    if (sigma) {
      last = sigma
      continue
    }
    if (!isTokenCanvasRow(row)) continue
    for (const token of row.tokens) {
      const parsed = parseTokenResult(token)
      if (parsed) last = parsed
    }
  }
  return last
}

/**
 * Builds a single-step model tree from teacher-authored committed result chips.
 *
 * Returns `null` when no committed final result exists.
 */
export function buildTeacherStepTree(
  teacherRows: readonly DragDropMathCanvasRow[],
): { tree: StepNode[]; sourceTokenId: string } | null {
  const extracted = extractLastCommittedFinal(teacherRows)
  if (!extracted) return null

  return {
    tree: [
      {
        id: 'final',
        operator: extracted.operator,
        operands: [extracted.value],
        expected: extracted.value,
        unit: extracted.unit,
        deps: [],
      },
    ],
    sourceTokenId: extracted.sourceTokenId,
  }
}

/**
 * Builds a single-step student answer map from the latest committed result chip.
 *
 * Returns `null` when no committed final result exists.
 */
export function buildStudentAnswers(
  studentRows: readonly DragDropMathCanvasRow[],
): { answers: Record<'final', StudentStep>; sourceTokenId: string } | null {
  const extracted = extractLastCommittedFinal(studentRows)
  if (!extracted) return null

  return {
    answers: {
      final: {
        nodeId: 'final',
        operator: extracted.operator,
        operands: [extracted.value],
        actual: extracted.value,
        unit: extracted.unit,
        notation: {
          decimal: 'comma',
          rounded: false,
        },
      },
    },
    sourceTokenId: extracted.sourceTokenId,
  }
}
