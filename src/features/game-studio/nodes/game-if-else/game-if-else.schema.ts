import type { PublishIssue } from '../../types/publish-validation.types'

export type GameIfElseCorrectPath = 'A' | 'B'

export type GameIfElseNodeData = {
  label?: string
  title?: string
  description?: string
  condition?: string
  correctMessage?: string
  wrongMessage?: string
  /** Minimum score on the incoming step to follow branch A (right-top); below → branch B. */
  scoreThreshold?: number
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
  const issues: PublishIssue[] = []
  if (typeof d.scoreThreshold !== 'number' || !Number.isFinite(d.scoreThreshold)) {
    issues.push({ code: 'ifElse.scoreThreshold.missing', severity: 'warning' })
  }
  if (!String(d.condition ?? '').trim()) {
    issues.push({ code: 'ifElse.condition.missing', severity: 'warning' })
  }
  return issues
}
