import type { PublishIssue } from '../../types/publish-validation.types'

export type GameStartNodeData = {
  label?: string
  title?: string
  description?: string
}

export const GAME_START_TYPE = 'gameStart' as const

export const gameStartDefaultConfig: GameStartNodeData = {
  label: 'Start',
}

export function validateGameStartConfig(data: unknown): PublishIssue[] {
  void data
  // Start has no author-facing fields yet — graph rules cover structural role.
  return []
}
