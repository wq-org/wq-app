import type { GameOpenQuestionNodeData } from '../types/open-question.schema'
import { resolveGameOpenQuestionPoints } from './openQuestionPoints'

export type OpenQuestionScoreBreakdown = {
  readonly maxPoints: number
  /** When false, the settings accordion shows a placeholder until scoring logic is wired. */
  readonly isCalculated: boolean
  readonly detailLines: readonly string[]
}

/**
 * Describes how max score maps to learner points. Returns `isCalculated: false` until
 * open-question evaluation rules are implemented.
 */
export function buildOpenQuestionScoreBreakdown(
  nodeData: GameOpenQuestionNodeData,
): OpenQuestionScoreBreakdown {
  const maxPoints = resolveGameOpenQuestionPoints(nodeData.points)

  return {
    maxPoints,
    isCalculated: false,
    detailLines: [],
  }
}
