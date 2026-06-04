'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleQuestionMark, HandHelping } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AiPromptBadgeList, type Ai02PromptSuggestion } from '@/components/shared/ai-components'
import { hasLexicalEditorContent } from '@/components/shared/chat'
import { Text } from '@/components/ui/text'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'

import { isLiveScoringEnabled } from '../api/scoringApi'
import { useScoring } from '../hooks/useScoring'
import { useOpenQuestionPreviewLoop } from '../hooks/useOpenQuestionPreviewLoop'
import type { GameOpenQuestionNodeData } from '../types/open-question.schema'
import { collectPreviewStudentAnswer } from '../utils/collectPreviewStudentAnswer'
import { buildOpenQuestionScoringRequest, resolveGameOpenQuestionPoints } from '../utils'
import { OpenQuestionChatInput } from './OpenQuestionChatInput'
import {
  OpenQuestionPreviewChatHistory,
  type OpenQuestionPreviewChatMessage,
} from './OpenQuestionPreviewChatHistory'
import { OpenQuestionSubmitConfirmDialog } from './OpenQuestionSubmitConfirmDialog'

export type OpenQuestionPreviewProps = {
  nodeId: string
  nodeData?: GameOpenQuestionNodeData
  onSessionScoreChange?: (score: number) => void
}

function questionMarkerId(nodeId: string, index: number, questionId: string): string {
  return `${nodeId}-question-${index}-${questionId}`
}

export function OpenQuestionPreview({
  nodeId,
  nodeData,
  onSessionScoreChange,
}: OpenQuestionPreviewProps) {
  const { t } = useTranslation('features.gameStudio')
  const { profile, getUserId, getUserInstitutionId } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)
  const { isScoring, scoreAnswer } = useScoring('game-studio-preview')

  const data = useMemo(() => nodeData ?? {}, [nodeData])
  const maxScore = resolveGameOpenQuestionPoints(data.points)
  const descriptionContent = data.descriptionContent ?? null
  const title = data.title?.trim() || data.label?.trim() || ''
  const showDescription = hasLexicalEditorContent(descriptionContent)
  const showTitle = title.length > 0

  const loop = useOpenQuestionPreviewLoop({ questions: data.questions, maxScore })
  const {
    filledQuestions,
    currentIndex,
    currentQuestion,
    pointsPerQuestion,
    earnedTotal,
    isFinished,
    isAdvancing,
    recordAwardAndAdvance,
    reset,
  } = loop

  useEffect(() => {
    onSessionScoreChange?.(earnedTotal)
  }, [earnedTotal, onSessionScoreChange])

  const [composerValue, setComposerValue] = useState('')
  const [previewMessages, setPreviewMessages] = useState<OpenQuestionPreviewChatMessage[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  /** Answer held until the user confirms in the submit dialog — not shown in chat yet. */
  const [pendingAnswerText, setPendingAnswerText] = useState<string | null>(null)
  const scoringInFlightRef = useRef(false)

  const avatarFallback =
    profile?.display_name?.trim().charAt(0).toUpperCase() ??
    profile?.username?.trim().charAt(0).toUpperCase() ??
    profile?.email?.trim().charAt(0).toUpperCase() ??
    'U'

  const submitAnswerPrompt = t('openQuestionGamePreview.submitAnswerPrompt')
  const hintPrompt = t('openQuestionGamePreview.hintPrompt')
  const howToPlayPrompt = t('openQuestionGamePreview.howToPlayPrompt')
  const howToPlayResponse = t('openQuestionGamePreview.howToPlayResponse')

  const systemPrompts = useMemo(
    () => new Set([submitAnswerPrompt, hintPrompt, howToPlayPrompt]),
    [hintPrompt, howToPlayPrompt, submitAnswerPrompt],
  )

  const institutionId = profile?.institution?.id ?? getUserInstitutionId() ?? 'game-studio-preview'
  const sessionParticipantId = `${nodeId}-preview-${getUserId() ?? 'anonymous'}`

  const appendMessage = useCallback((message: OpenQuestionPreviewChatMessage) => {
    setPreviewMessages((prev) => [...prev, message])
  }, [])

  const filledQuestionIdsSignature = useMemo(
    () => filledQuestions.map((question) => question.id).join('|'),
    [filledQuestions],
  )

  useEffect(() => {
    setPreviewMessages([])
    setEditingMessageId(null)
    setComposerValue('')
    setSubmitDialogOpen(false)
    setPendingAnswerText(null)
    reset()
  }, [filledQuestionIdsSignature, reset])

  useEffect(() => {
    if (!currentQuestion) return
    const markerId = questionMarkerId(nodeId, currentIndex, currentQuestion.id)
    setPreviewMessages((prev) => {
      if (prev.some((message) => message.id === markerId)) return prev
      const text = t('openQuestionGamePreview.questionMessage', {
        index: currentIndex + 1,
        total: filledQuestions.length,
        text: currentQuestion.question,
      })
      return [...prev, { id: markerId, direction: 'receiving', text }]
    })
  }, [currentIndex, currentQuestion, filledQuestions.length, nodeId, t])

  const liveScoringEnabled = isLiveScoringEnabled('game-studio-preview')

  useEffect(() => {
    if (!isFinished) return
    const finalSummaryId = `${nodeId}-final-summary`
    const finalSummaryText = liveScoringEnabled
      ? t('openQuestionGamePreview.iterationFinalSummary', {
          earned: earnedTotal,
          total: maxScore,
        })
      : t('openQuestionGamePreview.iterationFinalSummaryComingSoon')

    setPreviewMessages((prev) => {
      if (prev.some((message) => message.id === finalSummaryId)) return prev
      return [
        ...prev,
        {
          id: finalSummaryId,
          direction: 'receiving',
          text: finalSummaryText,
          textBold: true,
        },
      ]
    })
  }, [earnedTotal, isFinished, liveScoringEnabled, maxScore, nodeId, t])

  const runScoring = useCallback(
    async (messages: readonly OpenQuestionPreviewChatMessage[]) => {
      if (!currentQuestion || scoringInFlightRef.current) return
      scoringInFlightRef.current = true

      try {
        const markerId = questionMarkerId(nodeId, currentIndex, currentQuestion.id)
        const markerIndex = messages.findIndex((message) => message.id === markerId)
        const slice = markerIndex >= 0 ? messages.slice(markerIndex + 1) : messages
        const studentAnswer = collectPreviewStudentAnswer(slice, systemPrompts)

        if (studentAnswer.length === 0) {
          appendMessage({
            id: `${nodeId}-scoring-missing-answer-${Date.now()}`,
            direction: 'receiving',
            text: t('openQuestionGamePreview.scoringMissingAnswer'),
          })
          return
        }

        const teacherSolution = currentQuestion.answer.trim()
        if (teacherSolution.length === 0) {
          appendMessage({
            id: `${nodeId}-scoring-missing-solution-${Date.now()}`,
            direction: 'receiving',
            text: t('openQuestionGamePreview.scoringMissingReferenceAnswer'),
          })
          return
        }

        const loadingMessageId = `${nodeId}-scoring-loading-q${currentIndex}`
        const errorMessageId = `${nodeId}-scoring-error-q${currentIndex}`
        const resultMessageId = `${nodeId}-scoring-result-q${currentIndex}`

        setPreviewMessages((prev) => {
          const withoutStale = prev.filter(
            (message) =>
              message.id !== loadingMessageId &&
              message.id !== errorMessageId &&
              message.id !== resultMessageId,
          )
          return [
            ...withoutStale,
            {
              id: loadingMessageId,
              direction: 'receiving',
              text: t('openQuestionGamePreview.scoringInProgress'),
              status: 'loading',
            },
          ]
        })

        const result = await scoreAnswer(
          buildOpenQuestionScoringRequest({
            studentAnswer,
            referenceAnswer: teacherSolution,
            pointsPerQuestion,
            institutionId,
            sessionParticipantId: `${sessionParticipantId}-q${currentIndex}`,
          }),
        )

        setPreviewMessages((prev) => prev.filter((message) => message.id !== loadingMessageId))

        if (!result) {
          setPreviewMessages((prev) => {
            if (prev.some((message) => message.id === errorMessageId)) return prev
            return [
              ...prev,
              {
                id: errorMessageId,
                direction: 'receiving',
                text: t('openQuestionGamePreview.scoringFailed'),
              },
            ]
          })
          return
        }

        const resultText =
          result.availability === 'coming_soon'
            ? t('openQuestionGamePreview.scoringComingSoon')
            : t('openQuestionGamePreview.marksAwardedMessage', {
                marks: result.marksAwarded,
                total: result.totalPoints,
              })
        const attentionSuffix =
          result.availability === 'live' && result.requiresTeacherAttention
            ? `\n\n${t('openQuestionGamePreview.scoringNeedsAttention')}`
            : ''

        setPreviewMessages((prev) => {
          if (prev.some((message) => message.id === resultMessageId)) return prev
          return [
            ...prev,
            {
              id: resultMessageId,
              direction: 'receiving',
              text: `${resultText}${attentionSuffix}`,
              textBold: true,
            },
          ]
        })
        recordAwardAndAdvance(result.marksAwarded)
      } finally {
        scoringInFlightRef.current = false
      }
    },
    [
      appendMessage,
      currentIndex,
      currentQuestion,
      scoreAnswer,
      institutionId,
      nodeId,
      pointsPerQuestion,
      recordAwardAndAdvance,
      sessionParticipantId,
      systemPrompts,
      t,
    ],
  )

  const handleConfirmSubmit = useCallback(() => {
    const trimmed = pendingAnswerText?.trim() ?? ''
    if (!trimmed || !currentQuestion || scoringInFlightRef.current) return

    const answerMessage: OpenQuestionPreviewChatMessage = {
      id: `${nodeId}-answer-${currentIndex}-${currentQuestion.id}`,
      direction: 'sending',
      text: trimmed,
    }

    const nextMessages: OpenQuestionPreviewChatMessage[] = [...previewMessages, answerMessage]

    setPendingAnswerText(null)
    setComposerValue('')
    setEditingMessageId(null)
    setPreviewMessages(nextMessages)
    void runScoring(nextMessages)
  }, [currentIndex, currentQuestion, nodeId, pendingAnswerText, previewMessages, runScoring])

  const handleSubmitDialogOpenChange = useCallback((open: boolean) => {
    setSubmitDialogOpen(open)
    if (!open) {
      setPendingAnswerText(null)
    }
  }, [])

  const prompts = [
    {
      icon: HandHelping,
      text: t('openQuestionGamePreview.badgeHint'),
      prompt: hintPrompt,
      disabled: true,
    },
    {
      icon: CircleQuestionMark,
      text: t('openQuestionGamePreview.badgeHowToPlay'),
      prompt: howToPlayPrompt,
    },
  ] as const satisfies readonly Ai02PromptSuggestion[]

  const isComposerLocked =
    isScoring || isAdvancing || isFinished || filledQuestions.length === 0 || submitDialogOpen

  const handlePromptClick = useCallback(
    (message: string) => {
      if (message === howToPlayPrompt) {
        appendMessage({
          id: `${nodeId}-how-to-play-prompt-${Date.now()}`,
          direction: 'sending',
          text: howToPlayPrompt,
        })
        appendMessage({
          id: `${nodeId}-how-to-play-reply-${Date.now()}`,
          direction: 'receiving',
          text: howToPlayResponse,
        })
      }
    },
    [appendMessage, howToPlayPrompt, howToPlayResponse, nodeId],
  )

  const handleEditMessage = useCallback((messageId: string, text: string) => {
    setEditingMessageId(messageId)
    setComposerValue(text)
  }, [])

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      setPreviewMessages((prev) => prev.filter((message) => message.id !== messageId))
      if (editingMessageId === messageId) {
        setEditingMessageId(null)
        setComposerValue('')
      }
    },
    [editingMessageId],
  )

  const handleComposerSubmit = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isComposerLocked || !currentQuestion) return

      if (editingMessageId) {
        setPreviewMessages((prev) =>
          prev.map((message) =>
            message.id === editingMessageId ? { ...message, text: trimmed } : message,
          ),
        )
        setEditingMessageId(null)
        setComposerValue('')
        return
      }

      setPendingAnswerText(trimmed)
      setSubmitDialogOpen(true)
    },
    [currentQuestion, editingMessageId, isComposerLocked],
  )

  const hasFilledQuestions = filledQuestions.length > 0

  return (
    <div className="flex h-full flex-col gap-3">
      <Text
        as="p"
        variant="small"
        color="orange"
        className="shrink-0"
      >
        {t('openQuestionGamePreview.previewNotice')}
      </Text>

      {hasFilledQuestions ? (
        <Text
          as="p"
          variant="small"
          muted
          className="shrink-0"
        >
          {t('openQuestionGamePreview.iterationProgressLabel', {
            current: Math.min(currentIndex + 1, filledQuestions.length),
            total: filledQuestions.length,
            perQuestion: pointsPerQuestion,
          })}
        </Text>
      ) : null}

      <OpenQuestionPreviewChatHistory
        nodeId={nodeId}
        descriptionContent={descriptionContent}
        showDescription={showDescription}
        title={title}
        showTitle={showTitle}
        previewMessages={previewMessages}
        editingMessageId={editingMessageId}
        onEditSendingMessage={handleEditMessage}
        onDeleteSendingMessage={handleDeleteMessage}
        incomingAvatarUrl={userAvatarUrl ?? undefined}
        incomingAvatarFallback={avatarFallback}
        incomingBubbleVariant="default"
        receivingBubbleVariant="orange"
        className="min-h-0 flex-1"
      />

      <AiPromptBadgeList
        prompts={prompts}
        onPromptClick={handlePromptClick}
      />

      <OpenQuestionChatInput
        className="shrink-0"
        score={earnedTotal}
        maxScore={maxScore}
        placeholder={t('openQuestionGamePreview.composerPlaceholder')}
        value={composerValue}
        onValueChange={setComposerValue}
        onSubmit={handleComposerSubmit}
        disabled={isComposerLocked}
        clearOnSubmit={false}
      />

      <OpenQuestionSubmitConfirmDialog
        open={submitDialogOpen}
        onOpenChange={handleSubmitDialogOpenChange}
        onConfirm={handleConfirmSubmit}
      />
    </div>
  )
}
