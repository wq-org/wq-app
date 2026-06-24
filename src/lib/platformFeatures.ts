/** Teacher/student messaging UI is hidden until chat ships. */
export const PLATFORM_MESSAGING_CHAT_ENABLED = false

export function isPlatformMessagingChatEnabled(): boolean {
  return PLATFORM_MESSAGING_CHAT_ENABLED
}

export function withoutChatCommandItems<T extends { id: string }>(
  items: readonly T[],
): readonly T[] {
  if (PLATFORM_MESSAGING_CHAT_ENABLED) return items
  return items.filter((item) => item.id !== 'chat')
}
