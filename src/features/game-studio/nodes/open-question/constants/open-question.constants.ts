import type { GameOpenQuestionNodeData } from '../types/open-question.schema'

export const GAME_OPEN_QUESTION_TYPE = 'gameOpenQuestion' as const

export const GAME_OPEN_QUESTION_DEFAULT_POINTS = 10

/** Upper bound for the question-tab strip in `OpenQuestionEditor`. */
export const OPEN_QUESTION_MAX_QUESTIONS = 4

/** Pause after a graded answer before the next question is revealed in preview. */
export const OPEN_QUESTION_NEXT_DELAY_MS = 1500

export const gameOpenQuestionDefaultConfig: GameOpenQuestionNodeData = {
  label: 'Open question',
  title: '',
  points: GAME_OPEN_QUESTION_DEFAULT_POINTS,
  questions: [],
}
