import type { GameOpenQuestionNodeData } from '../types/open-question.schema'

export const GAME_OPEN_QUESTION_TYPE = 'gameOpenQuestion' as const

export const GAME_OPEN_QUESTION_DEFAULT_POINTS = 10

export const gameOpenQuestionDefaultConfig: GameOpenQuestionNodeData = {
  label: 'Open question',
  title: '',
  points: GAME_OPEN_QUESTION_DEFAULT_POINTS,
}
