import { useTranslation } from 'react-i18next'
import { CalendarClock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { GameRunStudentAttempt } from '../types/classroom-game.types'

type GameRunStudentAttemptListProps = {
  attempts: readonly GameRunStudentAttempt[]
  selectedRunId: string | null
  onSelectAttempt: (runId: string) => void
}

function formatPlayedAt(value: string | null, locale: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function GameRunStudentAttemptList({
  attempts,
  selectedRunId,
  onSelectAttempt,
}: GameRunStudentAttemptListProps) {
  const { t, i18n } = useTranslation('features.teacher')

  return (
    <div className="flex flex-col gap-3">
      {attempts.map((attempt) => {
        const selected = selectedRunId === attempt.runId
        const playedAt = formatPlayedAt(attempt.playedAt, i18n.language)

        const handleClick = () => onSelectAttempt(attempt.runId)

        return (
          <Card
            key={attempt.runId}
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick()
              }
            }}
            layout="flush"
            className={cn(
              'cursor-pointer py-3 transition-colors hover:border-blue-500',
              selected && 'border-blue-500 bg-blue-500/5',
            )}
          >
            <CardContent className="flex items-center justify-between gap-3 px-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-4" />
                <Text
                  as="span"
                  variant="small"
                >
                  {playedAt}
                </Text>
              </span>
              <Badge variant="secondary">
                {t('pages.gameRunAnalytics.attempts.score', { score: attempt.score })}
              </Badge>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
