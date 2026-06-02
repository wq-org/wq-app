export type GameIfElseCorrectPath = 'A' | 'B'

export type GameIfElseNodeData = {
  label?: string
  title?: string
  description?: string
  condition?: string
  correctMessage?: string
  wrongMessage?: string
  correctPath?: GameIfElseCorrectPath
}

export const GAME_IF_ELSE_TYPE = 'gameIfElse' as const

export const IF_ELSE_HANDLE_A = 'right-top' as const
export const IF_ELSE_HANDLE_B = 'right-bottom' as const

export const gameIfElseDefaultConfig: GameIfElseNodeData = {
  label: 'If / else',
}

export function validateGameIfElseConfig(): string[] {
  // Branching is always defined: correctPath defaults to 'A'.
  // Condition + messages are optional descriptive text only.
  return []
}
