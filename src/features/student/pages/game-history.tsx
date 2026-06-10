import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { GameRunAnalyticsPanel, getClassroomDeliveredGame } from '@/features/classroom'

export function StudentGameHistoryPage() {
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
        role="student"
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

  const backHref = `/student/dashboard/classroom/${trimmedClassroomId}`

  return (
    <AppShell
      role="student"
      className="flex flex-col gap-8 animate-in fade-in-0 slide-in-from-bottom-4"
    >
      <div className="container py-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-6 w-fit"
          asChild
        >
          <Link to={backHref}>
            <ArrowLeft className="size-4" />
            {t('pages.classroomDetail.publishedCourse.backToClassroom')}
          </Link>
        </Button>

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
            {t('pages.gameRunAnalytics.myHistoryDescription')}
          </Text>
        </div>

        <div className="mt-10">
          <GameRunAnalyticsPanel
            classroomId={trimmedClassroomId}
            gameId={trimmedGameId}
            ownOnly
          />
        </div>
      </div>
    </AppShell>
  )
}
