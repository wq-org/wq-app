import type { PublishIssue } from '../../types/publish-validation.types'

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

export function validateGameIfElseConfig(data: unknown): PublishIssue[] {
  const d = (data ?? {}) as GameIfElseNodeData
  if (!String(d.condition ?? '').trim()) {
    return [{ code: 'ifElse.condition.missing', severity: 'warning' }]
  }
  return []
}
