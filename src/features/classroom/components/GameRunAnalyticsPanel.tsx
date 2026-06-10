import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartLine, MousePointerClick } from 'lucide-react'

import { LoadingPage } from '@/components/shared'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'

import { useGameRunAnalytics, useGameRunAnalyticsDetail } from '../hooks/useGameRunAnalytics'
import { groupGameRunsByStudent } from '../utils/groupGameRunsByStudent'
import { parseGameRunChatHistory } from '../utils/parseGameRunChatHistory'
import { GameRunChatHistoryPanel } from './GameRunChatHistoryPanel'
import { GameRunComponentScoreRow } from './GameRunComponentScoreRow'
import { GameRunStudentAttemptList } from './GameRunStudentAttemptList'
import { GameRunStudentList } from './GameRunStudentList'

type GameRunAnalyticsPanelProps = {
  classroomId: string
  gameId: string
  /** Student mode: restrict the view to the signed-in user's own attempts. */
  ownOnly?: boolean
}

function formatPlayedAt(value: string | null, locale: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

/**
 * Drill-down analytics for one delivered game: students → attempts (entry date
 * + total score) → per-component breakdown + stored chat history.
 */
export function GameRunAnalyticsPanel({
  classroomId,
  gameId,
  ownOnly = false,
}: GameRunAnalyticsPanelProps) {
  const { t, i18n } = useTranslation('features.teacher')
  const { getUserId } = useUser()
  const { runs, loading, error } = useGameRunAnalytics(classroomId, gameId)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const ownUserId = getUserId()

  const groups = useMemo(() => {
    const all = groupGameRunsByStudent(runs)
    if (!ownOnly) return all
    return all.filter((group) => group.userId === ownUserId)
  }, [runs, ownOnly, ownUserId])

  const effectiveUserId = ownOnly ? ownUserId : selectedUserId
  const selectedGroup = groups.find((group) => group.userId === effectiveUserId) ?? null
  const selectedAttempt =
    selectedGroup?.attempts.find((attempt) => attempt.runId === selectedRunId) ?? null

  const {
    detail,
    loading: detailLoading,
    error: detailError,
  } = useGameRunAnalyticsDetail(classroomId, gameId, selectedRunId ?? undefined)

  const participantDetail =
    detail?.participantDetails.find((row) => row.userId === effectiveUserId) ?? null
  const chatHistory = useMemo(
    () => parseGameRunChatHistory(selectedAttempt?.sessionPayload),
    [selectedAttempt?.sessionPayload],
  )

  const handleSelectStudent = (userId: string) => {
    setSelectedUserId(userId)
    setSelectedRunId(null)
  }

  const handleResetToStudents = () => {
    setSelectedUserId(null)
    setSelectedRunId(null)
  }

  const handleResetToAttempts = () => {
    setSelectedRunId(null)
  }

  if (loading) {
    return (
      <LoadingPage
        variant="embedded"
        message={t('pages.gameRunAnalytics.loading')}
        size={72}
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
        {t('pages.gameRunAnalytics.loadError')}
      </Text>
    )
  }

  if (groups.length === 0) {
    return (
      <Empty className="rounded-xl border-dashed border-border/70 bg-muted/20 p-4 md:p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartLine className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('pages.gameRunAnalytics.emptyTitle')}</EmptyTitle>
          <EmptyDescription>{t('pages.gameRunAnalytics.emptyDescription')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const rootCrumbLabel = ownOnly
    ? t('pages.gameRunAnalytics.breadcrumb.myAttempts')
    : t('pages.gameRunAnalytics.breadcrumb.students')
  const selectedAttemptLabel = selectedAttempt
    ? formatPlayedAt(selectedAttempt.playedAt, i18n.language)
    : null

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {selectedGroup && !ownOnly ? (
              <BreadcrumbLink
                asChild
                className="cursor-pointer"
              >
                <button
                  type="button"
                  onClick={handleResetToStudents}
                >
                  {rootCrumbLabel}
                </button>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{rootCrumbLabel}</BreadcrumbPage>
            )}
          </BreadcrumbItem>

          {selectedGroup && !ownOnly ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {selectedAttempt ? (
                  <BreadcrumbLink
                    asChild
                    className="cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={handleResetToAttempts}
                    >
                      {selectedGroup.displayName}
                    </button>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{selectedGroup.displayName}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          ) : null}

          {selectedAttemptLabel ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedAttemptLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>

      {!selectedGroup && !ownOnly ? (
        <GameRunStudentList
          groups={groups}
          selectedUserId={selectedUserId}
          onSelectStudent={handleSelectStudent}
        />
      ) : selectedGroup ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <section className="flex flex-col gap-3">
            <Text
              as="h2"
              variant="h3"
              className="text-base font-semibold"
            >
              {t('pages.gameRunAnalytics.attempts.title')}
            </Text>
            <BlurredScrollArea
              className="h-[min(28rem,60vh)] rounded-2xl"
              orientation="vertical"
              hideScrollBar
            >
              <GameRunStudentAttemptList
                attempts={selectedGroup.attempts}
                selectedRunId={selectedRunId}
                onSelectAttempt={setSelectedRunId}
              />
            </BlurredScrollArea>
          </section>

          <section className="flex flex-col gap-3">
            {!selectedAttempt ? (
              <Empty className="min-h-[min(28rem,60vh)] rounded-2xl border border-dashed border-border/70 bg-muted/10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MousePointerClick className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>{t('pages.gameRunAnalytics.attempts.emptyTitle')}</EmptyTitle>
                  <EmptyDescription>
                    {t('pages.gameRunAnalytics.attempts.selectHint')}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Card layout="flush">
                <CardHeader className="pt-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <span>
                      {t('pages.gameRunAnalytics.detail.playedAt', {
                        playedAt: selectedAttemptLabel,
                      })}
                    </span>
                    {selectedAttempt?.versionNo != null && (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        v{selectedAttempt.versionNo}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-4">
                  {detailLoading ? (
                    <Text
                      as="p"
                      variant="small"
                      muted
                    >
                      {t('pages.gameRunAnalytics.detail.loading')}
                    </Text>
                  ) : detailError ? (
                    <Text
                      as="p"
                      variant="small"
                      className="text-destructive"
                    >
                      {t('pages.gameRunAnalytics.detail.loadError')}
                    </Text>
                  ) : participantDetail ? (
                    <>
                      <Text
                        as="p"
                        variant="small"
                        bold
                      >
                        {t('pages.gameRunAnalytics.detail.totalScore', {
                          score: participantDetail.totalScore,
                          maxScore: participantDetail.maxTotalScore,
                        })}
                      </Text>

                      {participantDetail.componentScores.length === 0 ? (
                        <Text
                          as="p"
                          variant="small"
                          muted
                        >
                          {t('pages.gameRunAnalytics.detail.noComponentBreakdown')}
                        </Text>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {participantDetail.componentScores.map((component) => (
                            <GameRunComponentScoreRow
                              key={component.nodeId}
                              component={component}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Text
                      as="p"
                      variant="small"
                      muted
                    >
                      {t('pages.gameRunAnalytics.detail.noParticipants')}
                    </Text>
                  )}

                  <div className="flex flex-col gap-2">
                    <Text
                      as="h3"
                      variant="small"
                      bold
                    >
                      {t('pages.gameRunAnalytics.chatHistory.title')}
                    </Text>
                    <GameRunChatHistoryPanel messages={chatHistory} />
                  </div>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
