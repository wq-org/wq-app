import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { Text } from '@/components/ui/text'
import { GameRunAnalyticsPanel, getClassroomDeliveredGame } from '@/features/classroom'

export function GameRunAnalyticsPage() {
  const { t } = useTranslation('features.teacher')
  const { classroomId, gameId } = useParams<{ classroomId: string; gameId: string }>()
  const [gameTitle, setGameTitle] = useState<string | null>(null)

  const trimmedClassroomId = classroomId?.trim()
  const trimmedGameId = gameId?.trim()

  useEffect(() => {
    if (!trimmedClassroomId || !trimmedGameId) return

    void getClassroomDeliveredGame(trimmedClassroomId, trimmedGameId)
      .then((game) => setGameTitle(game?.title ?? null))
      .catch(() => setGameTitle(null))
  }, [trimmedClassroomId, trimmedGameId])

  const displayTitle = useMemo(() => {
    const fromGame = gameTitle?.trim()
    if (fromGame) return fromGame
    return t('pages.gameRunAnalytics.titleFallback')
  }, [gameTitle, t])

  if (!trimmedClassroomId || !trimmedGameId) {
    return (
      <AppShell
        role="teacher"
        className="flex flex-col gap-6"
      >
        <div className="container py-10">
          <Text
            as="p"
            variant="body"
            muted
          >
            {t('pages.gameRunAnalytics.invalidLink')}
          </Text>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      role="teacher"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container py-6">
        <div className="text-center">
          <Text
            as="h1"
            variant="h1"
          >
            {displayTitle}
          </Text>
          <Text
            as="p"
            variant="body"
            muted
            className="mt-2"
          >
            {t('pages.gameRunAnalytics.description')}
          </Text>
        </div>

        <div className="mt-10">
          <GameRunAnalyticsPanel
            classroomId={trimmedClassroomId}
            gameId={trimmedGameId}
          />
        </div>
      </div>
    </AppShell>
  )
}
