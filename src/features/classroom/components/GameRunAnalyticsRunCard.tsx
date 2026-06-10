import { useTranslation } from 'react-i18next'
import { CalendarClock, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import type { GameRunAnalyticsItem } from '../types/classroom-game.types'

type GameRunAnalyticsRunCardProps = {
  run: GameRunAnalyticsItem
  selected?: boolean
  onSelect: (runId: string) => void
}

function formatRunTimestamp(value: string | null, locale: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function GameRunAnalyticsRunCard({
  run,
  selected = false,
  onSelect,
}: GameRunAnalyticsRunCardProps) {
  const { t, i18n } = useTranslation('features.teacher')

  const playedAt = formatRunTimestamp(run.startedAt ?? run.endedAt, i18n.language)
  const topScore = run.participants.reduce((max, row) => Math.max(max, row.score), 0)
  const participantCount = run.participants.length

  const handleClick = () => {
    onSelect(run.id)
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'cursor-pointer transition-colors hover:border-blue-500',
        selected && 'border-blue-500 bg-blue-500/5',
      )}
    >
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            {t('pages.gameRunAnalytics.runCard.title', { playedAt })}
          </CardTitle>
          <Badge variant="secondary">{run.status}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-4" />
            {playedAt}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" />
            {t('pages.gameRunAnalytics.runCard.participants', { count: participantCount })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('pages.gameRunAnalytics.runCard.topScore', { score: topScore })}
        </Text>
      </CardContent>
    </Card>
  )
}
