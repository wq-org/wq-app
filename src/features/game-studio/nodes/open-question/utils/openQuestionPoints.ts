import { GAME_OPEN_QUESTION_DEFAULT_POINTS } from '../constants/open-question.constants'
import type { GameOpenQuestionNodeData } from '../types/open-question.schema'

export function resolveGameOpenQuestionPoints(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : GAME_OPEN_QUESTION_DEFAULT_POINTS
}

export function getMissingOpenQuestionDefaults(
  data: GameOpenQuestionNodeData,
): Partial<GameOpenQuestionNodeData> {
  const patch: Partial<GameOpenQuestionNodeData> = {}

  if (
    typeof data.points !== 'number' ||
    !Number.isFinite(data.points) ||
    data.points < 0 ||
    data.points !== Math.floor(data.points)
  ) {
    patch.points = GAME_OPEN_QUESTION_DEFAULT_POINTS
  }

  return patch
}
