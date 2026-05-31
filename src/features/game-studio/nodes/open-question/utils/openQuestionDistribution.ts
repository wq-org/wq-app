import type { OpenQuestionAuthoredQuestion } from '../types/open-question.schema'
import { normalizeAuthoredQuestions } from './normalizeOpenQuestion'

/** Even split rounded to one decimal — falls back to `maxPoints` when 0/undefined questions. */
export function calcPointsPerOpenQuestion(maxPoints: number, filledCount: number): number {
  if (!Number.isFinite(maxPoints) || maxPoints <= 0) return 0
  if (filledCount <= 0) return Math.round(maxPoints * 10) / 10
  return Math.round((maxPoints / filledCount) * 10) / 10
}

/** Exercises with a non-empty learner prompt (shown in preview). */
export function collectPreviewableOpenQuestions(
  questions: readonly OpenQuestionAuthoredQuestion[] | undefined,
): OpenQuestionAuthoredQuestion[] {
  return normalizeAuthoredQuestions(questions).filter((item) => item.question.trim().length > 0)
}

/**
 * Exercises ready for scoring: learner prompt + reference answer both filled.
 * Only these count toward the per-exercise point split in settings.
 */
export function collectGradableOpenQuestions(
  questions: readonly OpenQuestionAuthoredQuestion[] | undefined,
): OpenQuestionAuthoredQuestion[] {
  return collectPreviewableOpenQuestions(questions).filter((item) => item.answer.trim().length > 0)
}

/** @deprecated Use `collectPreviewableOpenQuestions` or `collectGradableOpenQuestions`. */
export function collectFilledOpenQuestions(
  questions: readonly OpenQuestionAuthoredQuestion[] | undefined,
): OpenQuestionAuthoredQuestion[] {
  return collectPreviewableOpenQuestions(questions)
}
