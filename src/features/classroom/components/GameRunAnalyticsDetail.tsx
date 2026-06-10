import { useTranslation } from 'react-i18next'

import { LoadingPage } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Text } from '@/components/ui/text'

import type { GameRunAnalyticsDetail } from '../types/classroom-game.types'
import { GameRunComponentScoreRow } from './GameRunComponentScoreRow'

type GameRunAnalyticsDetailProps = {
  detail: GameRunAnalyticsDetail | null
  loading: boolean
  error: string | null
}

function formatTimestamp(value: string | null, locale: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function GameRunAnalyticsDetailPanel({
  detail,
  loading,
  error,
}: GameRunAnalyticsDetailProps) {
  const { t, i18n } = useTranslation('features.teacher')

  if (loading) {
    return (
      <LoadingPage
        variant="embedded"
        message={t('pages.gameRunAnalytics.detail.loading')}
        size={48}
      />
    )
  }

  if (error) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-sm text-destructive"
      >
        {t('pages.gameRunAnalytics.detail.loadError')}
      </Text>
    )
  }

  if (!detail) {
    return (
      <Text
        as="p"
        variant="body"
        muted
        className="text-sm"
      >
        {t('pages.gameRunAnalytics.detail.selectRun')}
      </Text>
    )
  }

  const playedAt = formatTimestamp(detail.startedAt ?? detail.endedAt, i18n.language)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Text
          as="h2"
          variant="h2"
          className="text-lg font-semibold"
        >
          {t('pages.gameRunAnalytics.detail.title')}
        </Text>
        <Text
          as="p"
          variant="body"
          muted
          className="mt-1 text-sm"
        >
          {t('pages.gameRunAnalytics.detail.playedAt', { playedAt })}
        </Text>
      </div>

      {detail.participantDetails.length === 0 ? (
        <Text
          as="p"
          variant="body"
          muted
          className="text-sm"
        >
          {t('pages.gameRunAnalytics.detail.noParticipants')}
        </Text>
      ) : (
        detail.participantDetails.map((participant) => (
          <Card key={participant.id}>
            <CardHeader className="gap-1">
              <CardTitle className="text-base font-semibold">{participant.displayName}</CardTitle>
              <Text
                as="p"
                variant="small"
                muted
              >
                {t('pages.gameRunAnalytics.detail.totalScore', {
                  score: participant.totalScore,
                  maxScore: participant.maxTotalScore,
                })}
              </Text>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {participant.componentScores.length === 0 ? (
                <Text
                  as="p"
                  variant="small"
                  muted
                >
                  {t('pages.gameRunAnalytics.detail.noComponentBreakdown')}
                </Text>
              ) : (
                participant.componentScores.map((component) => (
                  <GameRunComponentScoreRow
                    key={component.nodeId}
                    component={component}
                  />
                ))
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
