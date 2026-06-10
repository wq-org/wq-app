import type { GamePlayChatMessage } from '@/features/game-studio'

type SessionPayloadShape = {
  chatHistory?: unknown
}

function isChatMessage(value: unknown): value is GamePlayChatMessage {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return (
    typeof row.id === 'string' &&
    typeof row.text === 'string' &&
    typeof row.time === 'string' &&
    (row.direction === 'incoming' || row.direction === 'receiving')
  )
}

/** Reads the stored chat transcript from a run's session_payload; [] when absent or malformed. */
export function parseGameRunChatHistory(sessionPayload: unknown): GamePlayChatMessage[] {
  if (!sessionPayload || typeof sessionPayload !== 'object') return []

  const chatHistory = (sessionPayload as SessionPayloadShape).chatHistory
  if (!Array.isArray(chatHistory)) return []

  return chatHistory.filter(isChatMessage)
}
