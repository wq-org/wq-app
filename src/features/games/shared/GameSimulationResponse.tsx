import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { IncomingChatMessageBubble } from '@/components/chat/IncomingChatMessageBubble'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Text } from '@/components/ui/text'
import TypingIndicator from '@/components/ui/typing-indicator'
import { cn } from '@/lib/utils'
import GameResultTable from './GameResultTable'
import type { GameSimulationResponseData } from './buildGameSimulationSummary'

type GameSimulationResponseView = 'summary' | 'details'

export interface GameSimulationResponseProps {
  response: GameSimulationResponseData | null
  className?: string
}

const STATUS_LABELS: Record<GameSimulationResponseData['status'], string> = {
  correct: 'Correct',
  wrong: 'Needs review',
  mixed: 'Partial',
}

const STATUS_CLASSES: Record<GameSimulationResponseData['status'], string> = {
  correct: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  wrong: 'border-red-200 bg-red-50 text-red-700',
  mixed: 'border-amber-200 bg-amber-50 text-amber-700',
}

export default function GameSimulationResponse({
  response,
  className,
}: GameSimulationResponseProps) {
  const [view, setView] = useState<GameSimulationResponseView>('summary')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!response) {
      setView('summary')
      setIsTyping(false)
      return
    }

    setView('summary')
    setIsTyping(true)

    const timeoutId = window.setTimeout(() => {
      setIsTyping(false)
    }, 700)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [response])

  if (!response) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute right-4 bottom-4 left-4 z-10 max-w-[32rem] space-y-3',
        className,
      )}
    >
      {view === 'details' && !isTyping ? (
        <div className="pointer-events-auto rounded-2xl border border-border bg-background shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <Text
              as="p"
              variant="small"
              className="font-semibold text-foreground"
            >
              Detailed results
            </Text>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full"
              onClick={() => setView('summary')}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="max-h-80 overflow-y-auto px-4 py-3">
            <GameResultTable
              rows={response.rows}
              totalEarned={response.totalEarned}
              totalMax={response.totalMax}
              title="Overall"
              wrapContent
            />
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto rounded-2xl border border-border bg-background/95 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Text
              as="p"
              variant="small"
              className="font-semibold text-foreground"
            >
              Result
            </Text>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
                STATUS_CLASSES[response.status],
              )}
            >
              {STATUS_LABELS[response.status]}
            </span>
          </div>

          <Select
            value={view}
            onValueChange={(nextValue) => setView(nextValue as GameSimulationResponseView)}
            disabled={isTyping}
          >
            <SelectTrigger
              size="sm"
              className="min-w-[7.5rem] rounded-full border-border bg-white text-xs shadow-none"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="details">Details</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-3 px-4 py-4">
          <Avatar className="mb-4 size-9 border border-border bg-black text-white">
            <AvatarFallback className="bg-black text-[11px] font-semibold text-white">
              AI
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {isTyping ? (
              <TypingIndicator
                className="items-end"
                bubbleClassName="border border-border !bg-muted"
                size="sm"
              />
            ) : (
              <IncomingChatMessageBubble
                text={response.summaryText}
                time={response.timeLabel}
                className="max-w-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
