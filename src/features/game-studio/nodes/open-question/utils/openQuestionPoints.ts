import { GAME_OPEN_QUESTION_DEFAULT_POINTS } from '../constants/open-question.constants'
import type {
  GameOpenQuestionNodeData,
  OpenQuestionAuthoredQuestion,
} from '../types/open-question.schema'

export function resolveGameOpenQuestionPoints(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : GAME_OPEN_QUESTION_DEFAULT_POINTS
}

function createDefaultAuthoredQuestion(): OpenQuestionAuthoredQuestion {
  return {
    id: `oq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: '',
    answer: '',
  }
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

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    const first = createDefaultAuthoredQuestion()
    patch.questions = [first]
    patch.activeExerciseId = first.id
  } else if (
    typeof data.activeExerciseId !== 'string' ||
    !data.questions.some((question) => question.id === data.activeExerciseId)
  ) {
    patch.activeExerciseId = data.questions[0]?.id
  }

  return patch
}
