import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, MessageSquareText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { useAccentClasses } from '@/hooks/useAccentClasses'
import { cn } from '@/lib/utils'

import type { GameRunStudentAttempt } from '../types/classroom-game.types'
import { parseGameRunChatHistory } from '../utils/parseGameRunChatHistory'
import {
  buildAttemptNodeBreakdown,
  type AttemptNodeBreakdown,
} from '../utils/buildAttemptNodeBreakdown'
import { GameNodeRegistryIcon } from './GameNodeRegistryIcon'

type GameRunStudentAttemptListProps = {
  attempts: readonly GameRunStudentAttempt[]
  selectedRunId: string | null
  onSelectAttempt: (runId: string) => void
  /** Selects the attempt and scrolls the chat history to the node's prompt message. */
  onJumpToNode: (runId: string, messageId: string) => void
  /** Selects the attempt and reveals its frozen chat-history replay. */
  onViewChat: (runId: string) => void
}

type AttemptBreakdown = {
  nodes: AttemptNodeBreakdown[]
  maxScore: number
}

function formatPlayedAt(value: string | null, locale: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

/**
 * One card per attempt: version, played-at, total score, a chronological list of scored
 * nodes (jump to each in the chat replay), and a button to open the frozen chat history.
 */
export function GameRunStudentAttemptList({
  attempts,
  selectedRunId,
  onSelectAttempt,
  onJumpToNode,
  onViewChat,
}: GameRunStudentAttemptListProps) {
  const { t, i18n } = useTranslation('features.teacher')
  const accentClasses = useAccentClasses()

  const breakdownByRun = useMemo(() => {
    const map = new Map<string, AttemptBreakdown>()
    for (const attempt of attempts) {
      const nodes = buildAttemptNodeBreakdown(parseGameRunChatHistory(attempt.sessionPayload))
      const maxScore = nodes.reduce((sum, node) => sum + node.maxScore, 0)
      map.set(attempt.runId, { nodes, maxScore })
    }
    return map
  }, [attempts])

  return (
    <div className="flex flex-col gap-3">
      {attempts.map((attempt) => {
        const selected = selectedRunId === attempt.runId
        const playedAt = formatPlayedAt(attempt.playedAt, i18n.language)
        const { nodes, maxScore } = breakdownByRun.get(attempt.runId) ?? { nodes: [], maxScore: 0 }

        return (
          <Card
            key={attempt.runId}
            role="button"
            tabIndex={0}
            onClick={() => onSelectAttempt(attempt.runId)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectAttempt(attempt.runId)
              }
            }}
            layout="flush"
            className={cn(
              'cursor-pointer transition-colors',
              accentClasses.hoverBorder,
              selected && accentClasses.solidBorder,
            )}
          >
            <CardContent className="flex flex-col gap-3 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
                  <CalendarClock className="size-4 shrink-0" />
                  <Text
                    as="span"
                    variant="small"
                    className="truncate"
                  >
                    {playedAt}
                  </Text>
                </span>
                {attempt.versionNo != null && (
                  <Badge
                    variant="outline"
                    className="shrink-0 font-mono text-xs"
                  >
                    v{attempt.versionNo}
                  </Badge>
                )}
              </div>

              <Text
                as="p"
                variant="small"
                bold
              >
                {t('pages.gameRunAnalytics.attempts.totalScore', {
                  score: attempt.score,
                  maxScore,
                })}
              </Text>

              {nodes.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {nodes.map((node) => (
                    <button
                      key={node.nodeId}
                      type="button"
                      title={t('pages.gameRunAnalytics.attempts.nodeScore', {
                        label: node.label,
                        score: node.score,
                        maxScore: node.maxScore,
                      })}
                      aria-label={t('pages.gameRunAnalytics.attempts.nodeScore', {
                        label: node.label,
                        score: node.score,
                        maxScore: node.maxScore,
                      })}
                      className="rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={(event) => {
                        event.stopPropagation()
                        onJumpToNode(attempt.runId, node.messageId)
                      }}
                    >
                      <GameNodeRegistryIcon
                        nodeType={node.nodeType}
                        className="border-blue-500/20 bg-blue-500/10 text-blue-500 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-300"
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              <Button
                type="button"
                variant="darkblue"
                size="sm"
                className="w-fit self-start"
                onClick={(event) => {
                  event.stopPropagation()
                  onViewChat(attempt.runId)
                }}
              >
                <MessageSquareText className="size-4" />
                {t('pages.gameRunAnalytics.attempts.viewChatHistory')}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
