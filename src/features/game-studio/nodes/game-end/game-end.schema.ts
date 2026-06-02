export type GameEndNodeData = {
  label?: string
  title?: string
  description?: string
}

export const GAME_END_TYPE = 'gameEnd' as const

export const gameEndDefaultConfig: GameEndNodeData = {
  label: 'End',
}

export function validateGameEndConfig(data: unknown): string[] {
  const errors: string[] = []
  const d = (data ?? {}) as Record<string, unknown>
  const title = String(d.title ?? d.label ?? '').trim()
  const description = String(d.description ?? '').trim()
  if (!title) errors.push('Missing title')
  if (!description) errors.push('Missing description')
  return errors
}
