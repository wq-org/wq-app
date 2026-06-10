import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { GamePlayChatMessage } from '@/features/game-studio'

type GameRunChatHistoryPanelProps = {
  messages: readonly GamePlayChatMessage[]
}

/** Read-only transcript of a stored play-through, rendered as chat bubbles. */
export function GameRunChatHistoryPanel({ messages }: GameRunChatHistoryPanelProps) {
  const { t } = useTranslation('features.teacher')

  if (messages.length === 0) {
    return (
      <Text
        as="p"
        variant="small"
        muted
      >
        {t('pages.gameRunAnalytics.chatHistory.empty')}
      </Text>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-muted/20 p-2">
      {messages.map((message) => {
        const isPlayer = message.direction === 'receiving'
        const hasScore = typeof message.score === 'number'

        return (
          <div
            key={message.id}
            className={cn('flex', isPlayer ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[92%] rounded-2xl px-3 py-2',
                isPlayer
                  ? 'bg-blue-500/10 text-foreground dark:bg-blue-500/20'
                  : 'bg-background shadow-sm ring-1 ring-foreground/5',
              )}
            >
              <Text
                as="p"
                variant="small"
                className="whitespace-pre-line"
              >
                {message.text}
              </Text>
              {isPlayer && hasScore ? (
                <Text
                  as="p"
                  variant="small"
                  muted
                  className="mt-0.5 text-xs"
                >
                  {t('pages.gameRunAnalytics.chatHistory.messageScore', {
                    score: message.score,
                    maxScore: message.maxScore ?? 0,
                  })}
                </Text>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
