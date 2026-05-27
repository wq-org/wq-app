import type { StepNode, StudentStep } from '../../types/scoring.types'

function unitScore(student: StudentStep | undefined, expected: StepNode): 0 | 0.5 | 1 {
  if (!student) return 0
  const studentUnit = student.unit.trim()
  const expectedUnit = expected.unit.trim()
  if (studentUnit.length === 0 || expectedUnit.length === 0) {
    return studentUnit === expectedUnit ? 1 : 0
  }
  return studentUnit === expectedUnit ? 1 : 0
}

function notationScore(student: StudentStep | undefined): 0 | 0.5 | 1 {
  if (!student) return 0
  return student.notation.decimal === 'comma' ? 1 : 0.5
}

function conceptScore(student: StudentStep | undefined, expected: StepNode): 0 | 0.5 | 1 {
  if (!student) return 0
  if (!Number.isFinite(student.actual)) return 0
  if (student.actual < 0 && expected.expected >= 0) return 0
  return 1
}

export type ErrorFreeBreakdown = {
  unit: 0 | 0.5 | 1
  notation: 0 | 0.5 | 1
  concept: 0 | 0.5 | 1
  average: number
}

export function errorFreeScore(
  student: StudentStep | undefined,
  expected: StepNode,
): ErrorFreeBreakdown {
  const unit = unitScore(student, expected)
  const notation = notationScore(student)
  const concept = conceptScore(student, expected)
  return {
    unit,
    notation,
    concept,
    average: (unit + notation + concept) / 3,
  }
}
