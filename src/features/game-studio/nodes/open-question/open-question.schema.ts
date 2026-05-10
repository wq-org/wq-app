export type GameOpenQuestionNodeData = {
  label?: string
  title?: string
}

export const GAME_OPEN_QUESTION_TYPE = 'gameOpenQuestion' as const

export const gameOpenQuestionDefaultConfig: GameOpenQuestionNodeData = {
  label: 'Open question',
  title: '',
}

/** Shell node — validation deferred until authoring UI exists. */
export function validateGameOpenQuestionConfig(data: unknown): string[] {
  void data
  return []
}
