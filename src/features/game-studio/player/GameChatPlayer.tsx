import { useEffect, useRef } from 'react'
import type { Edge, Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { GameChatMessage } from './GameChatMessage'
import { useGameChatSession } from './useGameChatSession'

export type GameChatPlayerProps = {
  nodes: Node[]
  edges: Edge[]
  className?: string
  /** Avatar shown next to system / node messages. */
  avatarUrl?: string
  avatarFallback?: string
}

/**
 * Chat-style runtime for a flow game. Walks the registered nodes via
 * `useGameChatSession`, rendering each turn with the shared chat bubbles.
 * The current node exposes Correct / Wrong shortcuts so the chat can
 * advance without each node implementing its own answer surface yet.
 */
export function GameChatPlayer({
  nodes,
  edges,
  className,
  avatarUrl,
  avatarFallback = 'AI',
}: GameChatPlayerProps) {
  const { turns, currentNode, isComplete, recordResult, reset } = useGameChatSession({
    nodes,
    edges,
  })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  return (
    <div
      className={cn(
        'flex h-full w-full max-w-2xl flex-col gap-4 rounded-3xl border border-border bg-white/60 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60',
        className,
      )}
    >
      <ScrollArea className="flex-1 min-h-0 rounded-2xl bg-white/40 px-4 dark:bg-zinc-950/40">
        <div className="flex flex-col gap-3 py-4">
          {turns.map((turn) => {
            const isReceiving = turn.role === 'player'
            return (
              <div
                key={turn.id}
                className={cn('flex', isReceiving ? 'justify-end' : 'justify-start')}
              >
                <GameChatMessage
                  turn={turn}
                  avatarUrl={avatarUrl}
                  avatarFallback={avatarFallback}
                />
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/70 bg-background/80 p-3 dark:border-white/10">
        {isComplete ? (
          <>
            <Text
              as="p"
              variant="small"
              className="text-muted-foreground"
            >
              Game complete.
            </Text>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
            >
              Restart
            </Button>
          </>
        ) : currentNode ? (
          <>
            <Text
              as="p"
              variant="small"
              className="text-muted-foreground"
            >
              Awaiting answer for{' '}
              <span className="font-medium text-foreground">
                {(currentNode.data as { label?: string; title?: string } | undefined)?.title ??
                  (currentNode.data as { label?: string } | undefined)?.label ??
                  currentNode.id}
              </span>
            </Text>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="confirm"
                onClick={() => recordResult({ outcome: 'correct', correct: 1, wrong: 0, score: 1 })}
              >
                Correct
              </Button>
              <Button
                size="sm"
                variant="delete"
                onClick={() => recordResult({ outcome: 'wrong', correct: 0, wrong: 1, score: 0 })}
              >
                Wrong
              </Button>
            </div>
          </>
        ) : (
          <Text
            as="p"
            variant="small"
            className="text-muted-foreground"
          >
            Add a Start and End node, then connect game nodes between them.
          </Text>
        )}
      </div>
    </div>
  )
}
