import { ReceivingChatMessageBubble, SendingChatMessageBubble } from '@/components/shared/chat'
import type { GameChatTurn } from './useGameChatSession'

export type GameChatMessageProps = {
  turn: GameChatTurn
  avatarUrl?: string
  avatarFallback?: string
}

export function GameChatMessage({ turn, avatarUrl, avatarFallback }: GameChatMessageProps) {
  if (turn.role === 'player') {
    return (
      <SendingChatMessageBubble
        text={turn.text}
        time={turn.time}
        variant="darkblue-on-blue"
      />
    )
  }
  return (
    <ReceivingChatMessageBubble
      text={turn.text}
      time={turn.time}
      variant={turn.role === 'system' ? 'blue-on-gray' : 'default'}
      avatarUrl={avatarUrl}
      avatarFallback={avatarFallback}
    />
  )
}
