import { useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Eye, RotateCcw } from 'lucide-react'

import { LoadingPage } from '@/components/shared'
import { GamePlayLeaveProvider } from '@/components/shared/ai-components/GamePlayLeaveProvider'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import {
  GamePreviewPlayFlow,
  buildPlaySessionChatHistory,
  computePlayPreviewSessionMaxScore,
  type GamePlaySessionResult,
  type GamePlaySessionSnapshot,
} from '@/features/game-studio'

import { useClassroomGamePlay } from '../hooks/useClassroomGamePlay'
import { useRecordGameRun } from '../hooks/useRecordGameRun'
import { buildLeaveSessionResults } from '../utils/buildLeaveSessionResults'

type ClassroomGamePlayPanelProps = {
  classroomId: string
  gameId: string
}

/**
 * Plays a delivered game through the real node-interaction runtime.
 * Teachers preview in-memory only; students get their completed run persisted
 * (score + full chat walkthrough) exactly once per session.
 */
export function ClassroomGamePlayPanel({ classroomId, gameId }: ClassroomGamePlayPanelProps) {
  const { t } = useTranslation('features.teacher')
  const navigate = useNavigate()
  const { getRole } = useUser()
  const { content, loading, error } = useClassroomGamePlay(classroomId, gameId)
  const { saveRun, isSaving, savedRunId, error: saveError } = useRecordGameRun()
  const [lastResult, setLastResult] = useState<GamePlaySessionResult | null>(null)
  const [sessionSnapshot, setSessionSnapshot] = useState<GamePlaySessionSnapshot | null>(null)
  const startedAtRef = useRef(new Date().toISOString())
  const hasPersistedRef = useRef(false)

  const isStudent = getRole() === 'student'

  const sessionMaxScore = useMemo(
    () => (content ? computePlayPreviewSessionMaxScore(content.nodes) : 0),
    [content],
  )

  const persistRun = useCallback(
    async (result: GamePlaySessionResult) => {
      if (!isStudent || !content || hasPersistedRef.current) return null

      const runId = await saveRun({
        gameId: content.gameId,
        classroomId: content.classroomId,
        gameDeliveryId: content.gameDeliveryId,
        gameVersionId: content.gameVersionId,
        score: result.score,
        maxScore: result.maxScore,
        resultsByNode: result.resultsByNode,
        chatHistory: result.chatHistory,
        nodeChatHistories: result.nodeChatHistories,
        startedAt: startedAtRef.current,
      })

      if (runId) {
        hasPersistedRef.current = true
        setLastResult(result)
      }

      return runId
    },
    [content, isStudent, saveRun],
  )

  const buildSnapshotResult = useCallback((): GamePlaySessionResult | null => {
    if (!content || !sessionSnapshot) return null

    const resultsByNode = buildLeaveSessionResults(
      content.nodes,
      content.edges,
      sessionSnapshot.resultsByNode,
    )

    return {
      score: sessionSnapshot.score,
      maxScore: sessionSnapshot.maxScore,
      resultsByNode,
      nodeChatHistories: sessionSnapshot.nodeChatHistories,
      chatHistory: buildPlaySessionChatHistory(
        content.nodes,
        content.edges,
        resultsByNode,
        sessionSnapshot.nodeChatHistories,
      ),
    }
  }, [content, sessionSnapshot])

  const handleSessionComplete = (result: GamePlaySessionResult) => {
    setLastResult(result)
    void persistRun(result)
  }

  const handleRetrySave = () => {
    if (!lastResult) return
    hasPersistedRef.current = false
    void persistRun(lastResult)
  }

  const handleConfirmLeave = useCallback(async () => {
    if (isStudent && content && sessionSnapshot && !hasPersistedRef.current) {
      const result = buildSnapshotResult()
      if (result) {
        await persistRun(result)
      }
    }
  }, [buildSnapshotResult, content, isStudent, persistRun, sessionSnapshot])

  const handleNavigateAway = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const leaveLabels = useMemo(() => {
    if (isStudent) {
      return {
        badgeLabel: t('pages.classroomGamePlay.leaveGame.badge'),
        dialogTitle: t('pages.classroomGamePlay.leaveGame.title'),
        dialogDescription: t('pages.classroomGamePlay.leaveGame.descriptionStudent'),
        cancelLabel: t('pages.classroomGamePlay.leaveGame.cancel'),
        confirmLabel: t('pages.classroomGamePlay.leaveGame.confirm'),
      }
    }

    return {
      badgeLabel: t('pages.classroomGamePlay.leaveGame.badge'),
      dialogTitle: t('pages.classroomGamePlay.leaveGame.title'),
      dialogDescription: t('pages.classroomGamePlay.leaveGame.descriptionTeacher'),
      cancelLabel: t('pages.classroomGamePlay.leaveGame.cancel'),
      confirmLabel: t('pages.classroomGamePlay.leaveGame.confirm'),
    }
  }, [isStudent, t])

  const guardActive = Boolean(
    content && sessionSnapshot && !sessionSnapshot.isComplete && !savedRunId,
  )

  if (loading) {
    return (
      <LoadingPage
        variant="embedded"
        message={t('pages.classroomGamePlay.loading')}
        size={72}
      />
    )
  }

  if (error) {
    return (
      <Text
        as="p"
        variant="body"
        className="text-destructive"
      >
        {t('pages.classroomGamePlay.loadError')}
      </Text>
    )
  }

  if (!content) {
    return (
      <Text
        as="p"
        variant="body"
        muted
      >
        {t('pages.classroomGamePlay.notAvailable')}
      </Text>
    )
  }

  const shouldShowSaveError = isStudent && saveError !== null && !isSaving && !savedRunId

  if (isStudent && isSaving) {
    return (
      <LoadingPage
        variant="embedded"
        message={t('pages.classroomGamePlay.saving')}
        size={72}
      />
    )
  }

  return (
    <GamePlayLeaveProvider
      labels={leaveLabels}
      guardActive={guardActive}
      onConfirmLeave={handleConfirmLeave}
      onNavigateAway={handleNavigateAway}
    >
      <div className="flex h-full min-h-0 flex-1 flex-col gap-3">
        <header className="shrink-0 space-y-1 text-center">
          <Text
            as="h1"
            variant="h3"
            className="text-lg font-semibold"
          >
            {content.title}
          </Text>
          {content.description ? (
            <Text
              as="p"
              variant="body"
              muted
            >
              {content.description}
            </Text>
          ) : null}
          {!isStudent ? (
            <Text
              as="p"
              variant="small"
              muted
              className="flex items-center justify-center gap-1.5 pt-1"
            >
              <Eye className="size-4 shrink-0" />
              {t('pages.classroomGamePlay.teacherPreviewNotice')}
            </Text>
          ) : null}
        </header>

        {shouldShowSaveError ? (
          <div className="flex shrink-0 justify-center">
            <span className="inline-flex items-center gap-2">
              <Text
                as="p"
                variant="small"
                className="text-destructive"
              >
                {t('pages.classroomGamePlay.saveError')}
              </Text>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRetrySave}
              >
                <RotateCcw className="size-4" />
                {t('pages.classroomGamePlay.retry')}
              </Button>
            </span>
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">
          <GamePreviewPlayFlow
            nodes={content.nodes}
            edges={content.edges}
            sessionMaxScore={sessionMaxScore}
            onSessionComplete={handleSessionComplete}
            onSessionSnapshot={setSessionSnapshot}
          />
        </div>
      </div>
    </GamePlayLeaveProvider>
  )
}
