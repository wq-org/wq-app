import { describe, expect, it } from 'vitest'

import { DEFAULT_SCORING_CONFIG } from '../../constants/scoring.defaults'
import type { DragDropMathCanvasRow } from '../../types/drag-drop-math.schema'
import {
  buildStudentAnswers,
  buildTeacherStepTree,
  extractCanvasScoringSteps,
  resolveFailedStepTokenIds,
} from './canvasStepAdapter'
import { pscaScore } from './pscaScoring'

const TOLERANCE = DEFAULT_SCORING_CONFIG.tolerance

function mathResultRow(
  rowId: string,
  tokenId: string,
  display: string,
  expression: string,
): DragDropMathCanvasRow {
  return {
    id: rowId,
    variant: 'math',
    tokens: [
      {
        id: `${tokenId}-eq`,
        variant: 'math',
        mathRole: 'equation',
        value: expression,
        expression,
        disabled: false,
      },
      {
        id: `${tokenId}-eq-sign`,
        variant: 'math',
        mathRole: 'equals',
        value: '=',
        disabled: true,
        mathShell: 'ghost',
      },
      {
        id: tokenId,
        variant: 'math',
        mathRole: 'result',
        value: display,
        disabled: true,
        mathShell: 'ghost',
      },
    ],
  }
}

function sigmaRow(
  rowId: string,
  resultTokenId: string,
  resultDisplay: string | null,
  result: number | null,
): DragDropMathCanvasRow {
  return {
    id: rowId,
    variant: 'sigma',
    lockedCategory: 'money',
    lockedUnit: '€',
    items: [],
    result,
    resultDisplay,
    resultTokenId,
  }
}

describe('canvasStepAdapter', () => {
  const teacherRows: DragDropMathCanvasRow[] = [
    mathResultRow('teacher-r1', 'teacher-t1', '111 €', '6 × 18,5 €'),
    mathResultRow('teacher-r2', 'teacher-t2', '114 €', '2 × 12 × 4,75 €'),
    mathResultRow('teacher-r3', 'teacher-t3', '387 €', '225 € × 1,72'),
    sigmaRow('teacher-sigma', 'teacher-sigma-result', '612 €', 612),
  ]

  it('extracts every committed result in row order', () => {
    const steps = extractCanvasScoringSteps(teacherRows)
    expect(steps).toHaveLength(4)
    expect(steps.map((step) => step.value)).toEqual([111, 114, 387, 612])
  })

  it('awards partial points when intermediate rows match but final sigma differs', () => {
    const studentRows: DragDropMathCanvasRow[] = [
      mathResultRow('student-r1', 'student-t1', '111 €', '6 × 18,5 €'),
      mathResultRow('student-r2', 'student-t2', '114 €', '2 × 12 × 4,75 €'),
      mathResultRow('student-r3', 'student-t3', '387 €', '225 € × 1,72'),
      sigmaRow('student-sigma', 'student-sigma-result', '501 €', 501),
    ]

    const teacher = buildTeacherStepTree(teacherRows)
    const student = teacher && buildStudentAnswers(studentRows, teacher.steps, TOLERANCE)
    expect(teacher).not.toBeNull()
    expect(student).not.toBeNull()
    if (!teacher || !student) return

    const result = pscaScore(teacher.tree, student.answers, DEFAULT_SCORING_CONFIG, 10)
    expect(result.R).toBe(0)
    expect(result.S).toBe(0.75)
    expect(result.awardedPoints).toBeGreaterThan(0)
    expect(result.awardedPoints).toBeLessThan(10)
  })

  it('matches reordered student rows by value rather than by row id (screenshot regression)', () => {
    // Mirrors the WQ-24 screenshot: 4 row tree (3 sub-results + sigma).
    // Student got every intermediate value right but dragged them in a different order
    // AND dropped a value-only chip for one row (missing the € unit), so the sigma sums wrong.
    const studentRows: DragDropMathCanvasRow[] = [
      mathResultRow('student-r1', 'student-t1', '630 €', '14 m² × 45 €/m²'),
      mathResultRow('student-r2', 'student-t2', '114 €', '2 × 12 × 4,75 €'),
      mathResultRow('student-r3', 'student-t3', '111', '6 × 18,5'),
      mathResultRow('student-r4', 'student-t4', '387 €', '225 € × 1,72'),
      sigmaRow('student-sigma', 'student-sigma-result', '501 €', 501),
    ]

    const teacherFiveRow: DragDropMathCanvasRow[] = [
      mathResultRow('teacher-r0', 'teacher-t0', '630 €', '14 m² × 45 €/m²'),
      mathResultRow('teacher-r1', 'teacher-t1', '111 €', '6 × 18,5 €'),
      mathResultRow('teacher-r2', 'teacher-t2', '114 €', '2 × 12 × 4,75 €'),
      mathResultRow('teacher-r3', 'teacher-t3', '387 €', '225 € × 1,72'),
      sigmaRow('teacher-sigma', 'teacher-sigma-result', '612 €', 612),
    ]

    const teacher = buildTeacherStepTree(teacherFiveRow)
    const student =
      teacher && buildStudentAnswers(studentRows, teacherFiveRow ? teacher.steps : [], TOLERANCE)
    if (!teacher || !student) throw new Error('expected teacher + student build')

    const result = pscaScore(teacher.tree, student.answers, DEFAULT_SCORING_CONFIG, 10)

    // 4 of 5 step values match (only the sigma is wrong) — so S = 4/5.
    expect(result.S).toBeCloseTo(0.8, 5)
    expect(result.R).toBe(0)
    expect(result.awardedPoints).toBeGreaterThan(4)
    expect(result.awardedPoints).toBeLessThan(5)
  })

  it('flags the STUDENT sigma token id (not the teacher id) when sigma value is wrong', () => {
    const studentRows: DragDropMathCanvasRow[] = [
      mathResultRow('student-r1', 'student-t1', '111 €', '6 × 18,5 €'),
      mathResultRow('student-r2', 'student-t2', '114 €', '2 × 12 × 4,75 €'),
      mathResultRow('student-r3', 'student-t3', '387 €', '225 € × 1,72'),
      sigmaRow('student-sigma', 'student-sigma-result', '501 €', 501),
    ]

    const teacher = buildTeacherStepTree(teacherRows)
    const student = teacher && buildStudentAnswers(studentRows, teacher.steps, TOLERANCE)
    if (!teacher || !student) throw new Error('expected teacher + student build')

    const result = pscaScore(teacher.tree, student.answers, DEFAULT_SCORING_CONFIG, 10)
    const failedIds = resolveFailedStepTokenIds(result.perStep, student.studentTokenIdByStepId)

    expect(failedIds).toContain('student-sigma-result')
    expect(failedIds).not.toContain('teacher-sigma-result')
  })

  it('returns zero answers when student canvas is empty (no crash)', () => {
    const teacher = buildTeacherStepTree(teacherRows)
    const student = teacher && buildStudentAnswers([], teacher.steps, TOLERANCE)
    if (!teacher || !student) throw new Error('expected teacher + student build')

    expect(Object.keys(student.answers)).toHaveLength(0)
    const result = pscaScore(teacher.tree, student.answers, DEFAULT_SCORING_CONFIG, 10)
    expect(result.awardedPoints).toBe(0)
  })
})
