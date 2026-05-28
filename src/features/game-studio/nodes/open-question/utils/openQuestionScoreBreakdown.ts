import type { GameOpenQuestionNodeData } from '../types/open-question.schema'
import { calcPointsPerOpenQuestion, collectGradableOpenQuestions } from './openQuestionDistribution'
import { resolveGameOpenQuestionPoints } from './openQuestionPoints'

export type OpenQuestionScoreBreakdown = {
  readonly maxPoints: number
  /** Count of authored questions with non-empty text. */
  readonly filledQuestionCount: number
  /** Points awarded for each filled question (max ÷ filled count, 1 decimal). */
  readonly pointsPerQuestion: number
  /** When false, the settings accordion shows a placeholder hint. */
  readonly isCalculated: boolean
  readonly detailLines: readonly string[]
}

/**
 * Describes how the configured max score maps to per-question awards.
 *
 * `pointsPerQuestion` is the even split rounded to one decimal — this matches
 * what the preview loop sends to the grading worker per question.
 */
export function buildOpenQuestionScoreBreakdown(
  nodeData: GameOpenQuestionNodeData,
): OpenQuestionScoreBreakdown {
  const maxPoints = resolveGameOpenQuestionPoints(nodeData.points)
  const filled = collectGradableOpenQuestions(nodeData.questions)
  const filledQuestionCount = filled.length
  const pointsPerQuestion = calcPointsPerOpenQuestion(maxPoints, filledQuestionCount)

  return {
    maxPoints,
    filledQuestionCount,
    pointsPerQuestion,
    isCalculated: filledQuestionCount > 0,
    detailLines: [],
  }
}
