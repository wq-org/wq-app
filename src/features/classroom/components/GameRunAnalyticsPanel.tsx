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
import { FieldInput } from '@/components/ui/field-input'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'

import { GameChatHistory, type GameChatHistoryMessage } from '@/features/game-studio'

import type { GameComponentScore } from '../types/classroom-game.types'
import { useGameRunAnalytics, useGameRunAnalyticsDetail } from '../hooks/useGameRunAnalytics'
import { useGameComponentImageUrls } from '../hooks/useGameComponentImageUrl'
import { groupGameRunsByStudent } from '../utils/groupGameRunsByStudent'
import { parseGameRunChatHistory } from '../utils/parseGameRunChatHistory'
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

  const [studentFilter, setStudentFilter] = useState('')

  const groups = useMemo(() => {
    const all = groupGameRunsByStudent(runs)
    if (!ownOnly) return all
    return all.filter((group) => group.userId === ownUserId)
  }, [runs, ownOnly, ownUserId])

  const visibleGroups = useMemo(() => {
    const query = studentFilter.trim().toLowerCase()
    if (!query) return groups
    return groups.filter((group) => group.displayName.toLowerCase().includes(query))
  }, [groups, studentFilter])

  const effectiveUserId = ownOnly ? ownUserId : selectedUserId
  const selectedGroup = groups.find((group) => group.userId === effectiveUserId) ?? null
  const selectedAttempt =
    selectedGroup?.attempts.find((attempt) => attempt.runId === selectedRunId) ?? null

  const [scrollMessageId, setScrollMessageId] = useState<string | undefined>(undefined)

  const { detail } = useGameRunAnalyticsDetail(classroomId, gameId, selectedRunId ?? undefined)

  const componentScores = useMemo(
    () =>
      detail?.participantDetails.find((row) => row.userId === effectiveUserId)?.componentScores ??
      [],
    [detail, effectiveUserId],
  )
  const imageUrlByNodeId = useGameComponentImageUrls(componentScores)
  const componentByNodeId = useMemo(() => {
    const map = new Map<string, GameComponentScore>()
    for (const component of componentScores) map.set(component.nodeId, component)
    return map
  }, [componentScores])

  // Enrich the stored transcript with the per-node breakdown: real labels, the Image Pin
  // image (re-signed), and the score earned — falling back to the raw transcript otherwise.
  const chatMessages = useMemo<GameChatHistoryMessage[]>(
    () =>
      parseGameRunChatHistory(selectedAttempt?.sessionPayload).map((message) => {
        const component = message.nodeId ? componentByNodeId.get(message.nodeId) : undefined
        const imageUrl = message.nodeId ? imageUrlByNodeId.get(message.nodeId) : undefined

        if (message.direction === 'incoming' && component) {
          return {
            id: message.id,
            time: message.time,
            direction: message.direction,
            text: component.label,
            image:
              message.image ??
              (imageUrl ? { variant: 'image-pin' as const, src: imageUrl } : undefined),
          }
        }

        if (message.direction === 'receiving' && component) {
          return {
            id: message.id,
            time: message.time,
            direction: message.direction,
            image: message.image,
            text: t('pages.gameRunAnalytics.attempts.nodeScore', {
              label: message.text,
              score: component.score,
              maxScore: component.maxScore,
            }),
          }
        }

        return {
          id: message.id,
          text: message.text,
          time: message.time,
          direction: message.direction,
          image: message.image,
        }
      }),
    [selectedAttempt?.sessionPayload, componentByNodeId, imageUrlByNodeId, t],
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

  const handleViewChat = (runId: string) => {
    setScrollMessageId(undefined)
    setSelectedRunId(runId)
  }

  const handleJumpToNode = (runId: string, messageId: string) => {
    setSelectedRunId(runId)
    setScrollMessageId(messageId)
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
        <div className="flex flex-col gap-4">
          <FieldInput
            value={studentFilter}
            onValueChange={setStudentFilter}
            label={t('pages.gameRunAnalytics.attempts.filterPlaceholder')}
            placeholder={t('pages.gameRunAnalytics.attempts.filterPlaceholder')}
            labelVisibility="sr-only"
            showSearchIcon
            size="compact"
          />
          <GameRunStudentList
            groups={visibleGroups}
            selectedUserId={selectedUserId}
            onSelectStudent={handleSelectStudent}
          />
        </div>
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
              className="h-[calc(100dvh-16rem)] min-h-[26rem] rounded-2xl"
              orientation="vertical"
              hideScrollBar
            >
              <GameRunStudentAttemptList
                attempts={selectedGroup.attempts}
                selectedRunId={selectedRunId}
                onSelectAttempt={setSelectedRunId}
                onJumpToNode={handleJumpToNode}
                onViewChat={handleViewChat}
              />
            </BlurredScrollArea>
          </section>

          <section className="flex flex-col gap-3">
            {!selectedAttempt ? (
              <Empty className="h-[calc(100dvh-16rem)] min-h-[26rem] rounded-2xl border border-dashed border-border/70 bg-muted/10">
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
              <Card
                layout="flush"
                className="flex h-[calc(100dvh-16rem)] min-h-[26rem] flex-col"
              >
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
                <CardContent className="flex min-h-0 flex-1 flex-col pb-4">
                  {chatMessages.length === 0 ? (
                    <Text
                      as="p"
                      variant="small"
                      muted
                    >
                      {t('pages.gameRunAnalytics.chatHistory.empty')}
                    </Text>
                  ) : (
                    <GameChatHistory
                      messages={chatMessages}
                      layout="play"
                      autoScroll={false}
                      scrollToMessageId={scrollMessageId}
                      className="min-h-0 flex-1"
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
