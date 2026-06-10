import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChartLine } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { AppShell } from '@/components/layout'
import { LoadingPage } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Text } from '@/components/ui/text'
import {
  GameRunAnalyticsDetailPanel,
  GameRunAnalyticsRunCard,
  getClassroomDeliveredGame,
  useGameRunAnalytics,
  useGameRunAnalyticsDetail,
} from '@/features/classroom'

export function GameRunAnalyticsPage() {
  const { t } = useTranslation('features.teacher')
  const { classroomId, gameId } = useParams<{ classroomId: string; gameId: string }>()
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [gameTitle, setGameTitle] = useState<string | null>(null)

  const trimmedClassroomId = classroomId?.trim()
  const trimmedGameId = gameId?.trim()

  const { runs, loading, error } = useGameRunAnalytics(trimmedClassroomId, trimmedGameId)
  const {
    detail,
    loading: detailLoading,
    error: detailError,
  } = useGameRunAnalyticsDetail(trimmedClassroomId, trimmedGameId, selectedRunId ?? undefined)

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

  const backHref = `/teacher/dashboard/classroom/${trimmedClassroomId}`

  return (
    <AppShell
      role="teacher"
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
            {t('pages.gameRunAnalytics.description')}
          </Text>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-4">
            <Text
              as="h2"
              variant="h2"
              className="text-lg font-semibold"
            >
              {t('pages.gameRunAnalytics.runsTitle')}
            </Text>

            {loading ? (
              <LoadingPage
                variant="embedded"
                message={t('pages.gameRunAnalytics.loading')}
                size={72}
              />
            ) : error ? (
              <Text
                as="p"
                variant="body"
                className="text-sm text-destructive"
              >
                {t('pages.gameRunAnalytics.loadError')}
              </Text>
            ) : runs.length === 0 ? (
              <Empty className="rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ChartLine className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>{t('pages.gameRunAnalytics.emptyTitle')}</EmptyTitle>
                  <EmptyDescription>
                    {t('pages.gameRunAnalytics.emptyDescription')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="flex flex-col gap-3">
                {runs.map((run) => (
                  <GameRunAnalyticsRunCard
                    key={run.id}
                    run={run}
                    selected={selectedRunId === run.id}
                    onSelect={setSelectedRunId}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col gap-4">
            <GameRunAnalyticsDetailPanel
              detail={detail}
              loading={detailLoading}
              error={detailError}
            />
          </section>
        </div>
      </div>
    </AppShell>
  )
}
