export type GameStartNodeData = {
  label?: string
  title?: string
  description?: string
}

export const GAME_START_TYPE = 'gameStart' as const

export const gameStartDefaultConfig: GameStartNodeData = {
  label: 'Start',
}

export function validateGameStartConfig(data: unknown): string[] {
  const errors: string[] = []
  const d = (data ?? {}) as Record<string, unknown>
  const title = String(d.title ?? d.label ?? '').trim()
  const description = String(d.description ?? '').trim()
  if (!title) errors.push('Missing title')
  if (!description) errors.push('Missing description')
  return errors
}
