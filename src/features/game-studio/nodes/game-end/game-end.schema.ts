import type { PublishIssue } from '../../types/publish-validation.types'

export type GameEndNodeData = {
  label?: string
  title?: string
  description?: string
}

export const GAME_END_TYPE = 'gameEnd' as const

export const gameEndDefaultConfig: GameEndNodeData = {
  label: 'End',
}

export function validateGameEndConfig(data: unknown): PublishIssue[] {
  void data
  // End has no author-facing fields yet — graph rules cover structural role.
  return []
}
