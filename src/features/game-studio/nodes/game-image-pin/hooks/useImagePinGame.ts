import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import confetti from 'canvas-confetti'
import { useTranslation } from 'react-i18next'
import type { GameChatHistoryMessage } from '../../../components/game-chat.types'
import {
  PIN_IMAGE_DROPPABLE_ID,
  PIN_SOURCE_DROPPABLE_ID,
} from '../constants/imagePinPreviewDnd.constants'
import {
  resolveGameImagePinDescription,
  resolveGameImagePinPoints,
  resolveGameImagePinRetryDeductionPercent,
  type GameImagePinNodeData,
  type GameImagePinRect,
} from '../image-pin.schema'
import { loadImageNaturalSize } from '../imagePinRectGeometry'
import {
  evaluatePinSubmission,
  type ImagePinSubmissionVariant,
  type NormalizedPinBounds,
  type NormalizedPinPoint,
} from '../imagePinValidation'
import { calcAttemptPoints, calcPointsPerQuestion } from '../../../utils/gameScoringUtils'

export {
  PIN_DRAGGABLE_ID,
  PIN_IMAGE_DROPPABLE_ID,
  PIN_SOURCE_DROPPABLE_ID,
} from '../constants/imagePinPreviewDnd.constants'

const POINTS_REVEAL_DELAY_MS = 500
const NEXT_QUESTION_DELAY_MS = 1500
const WRONG_FREEZE_DELAY_MS = 2000
export const MAX_ATTEMPTS = 4

export type PreviewQuestion = {
  id: string
  question: string
  rect: GameImagePinRect
}

export type ImagePinSubmission = {
  drop: NormalizedPinPoint
  variant: ImagePinSubmissionVariant
}

export type UseImagePinGameArgs = {
  nodeId: string
  nodeData: GameImagePinNodeData
  /** When true, skip confetti on each correct answer (parent may fire on session end). */
  suppressPerAnswerConfetti?: boolean
}

type ImageNaturalSize = { width: number; height: number }

type CurrentPin = {
  drop: NormalizedPinPoint
  bounds: NormalizedPinBounds
}

type PreviewState = {
  messages: GameChatHistoryMessage[]
  questionIndex: number
}

type ResolvedSession = {
  score: number
  shouldCelebrate: boolean
}

function formatPreviewChatTime(date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getPreviewImageSrc(nodeData: GameImagePinNodeData): string {
  return typeof nodeData.imagePreview === 'string' ? nodeData.imagePreview.trim() : ''
}

function getPreviewQuestions(nodeData: GameImagePinNodeData): PreviewQuestion[] {
  const rectangles = Array.isArray(nodeData.rectangles) ? nodeData.rectangles : []
  return rectangles.flatMap((rect) => {
    const question = String(rect.question ?? '').trim()
    if (!question) return []
    return [{ id: rect.id, question, rect }]
  })
}

function buildPreviewQuestionMessage(
  nodeId: string,
  imageSrc: string,
  question: PreviewQuestion,
  index: number,
): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-question-${index}-${question.id}`,
    text: question.question,
    time: formatPreviewChatTime(),
    direction: 'incoming',
    image: imageSrc
      ? {
          variant: 'image-pin',
          src: imageSrc,
          alt: 'Game Image Pin preview image',
          rect: question.rect,
        }
      : undefined,
  }
}

function buildPreviewRetryQuestionMessage(
  nodeId: string,
  imageSrc: string,
  question: PreviewQuestion,
  index: number,
  attempt: number,
): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-question-${index}-${question.id}-retry-${attempt}`,
    text: question.question,
    time: formatPreviewChatTime(),
    direction: 'incoming',
    image: imageSrc
      ? {
          variant: 'image-pin',
          src: imageSrc,
          alt: 'Game Image Pin preview image',
          rect: question.rect,
        }
      : undefined,
  }
}

function buildPreviewDescriptionMessage(
  nodeId: string,
  description: string,
): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-description`,
    text: description,
    time: formatPreviewChatTime(),
    direction: 'incoming',
  }
}

function buildPreviewAnswerMessage(
  text: string,
  nodeId: string,
  index: number,
): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-answer-${index}`,
    text,
    time: formatPreviewChatTime(),
    direction: 'receiving',
  }
}

function buildPreviewLoadingMessage(nodeId: string, index: number): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-loading-${index}`,
    text: '',
    time: formatPreviewChatTime(),
    direction: 'incoming',
    status: 'loading',
  }
}

function buildAssistantReplyMessage(
  text: string,
  nodeId: string,
  index: number,
): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-reply-${index}`,
    text,
    time: formatPreviewChatTime(),
    direction: 'incoming',
  }
}

function buildWrongRetryMessage(nodeId: string, seq: number, text: string): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-wrong-retry-${seq}`,
    text,
    time: formatPreviewChatTime(),
    direction: 'incoming',
  }
}

function buildPointsEarnedMessage(
  nodeId: string,
  seq: number,
  text: string,
): GameChatHistoryMessage {
  return {
    id: `preview-${nodeId}-points-${seq}`,
    text,
    time: formatPreviewChatTime(),
    direction: 'incoming',
    bold: true,
  }
}

function buildHowToPlayResponse(baseResponse: string, scoringResponse: string): string {
  return `${scoringResponse}\n\n${baseResponse}`
}

function buildInitialPreviewMessages(
  nodeId: string,
  imageSrc: string,
  description: string,
  questions: PreviewQuestion[],
): GameChatHistoryMessage[] {
  const messages: GameChatHistoryMessage[] = description
    ? [buildPreviewDescriptionMessage(nodeId, description)]
    : []
  const first = questions[0]
  if (!first) return messages
  return [...messages, buildPreviewQuestionMessage(nodeId, imageSrc, first, 0)]
}

function getQuestionIndexFromMessageId(messageId: string): number | null {
  const match = messageId.match(/-question-(\d+)-/)
  if (!match) return null
  const index = Number.parseInt(match[1], 10)
  return Number.isFinite(index) ? index : null
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function fireImagePinPreviewConfetti(): void {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  })
}

export function useImagePinGame({
  nodeId,
  nodeData,
  suppressPerAnswerConfetti = false,
}: UseImagePinGameArgs) {
  const { t } = useTranslation('features.gameStudio')
  const imageSrc = getPreviewImageSrc(nodeData)
  const description = resolveGameImagePinDescription(nodeData)
  const questions = useMemo(() => getPreviewQuestions(nodeData), [nodeData])
  const submitAnswerPrompt = t('imagePinGamePreview.submitAnswerPrompt')
  const howToPlayPrompt = t('imagePinGamePreview.howToPlayPrompt')

  const maxPoints = resolveGameImagePinPoints(nodeData.points)
  const deductionPercent = resolveGameImagePinRetryDeductionPercent(nodeData.retryDeductionPercent)
  const pointsPerQuestion = calcPointsPerQuestion(maxPoints, questions.length)
  const howToPlayResponse = buildHowToPlayResponse(
    t('imagePinGamePreview.howToPlayResponse'),
    t('imagePinGamePreview.howToPlayScoringResponse', {
      pointsPerQuestion,
      deductionPercent,
      maxAttempts: MAX_ATTEMPTS,
    }),
  )
  const formatPointsEarned = (points: number) =>
    t('imagePinGamePreview.pointsEarnedMessage', { points })

  const initialState = useMemo<PreviewState>(
    () => ({
      messages: buildInitialPreviewMessages(nodeId, imageSrc, description, questions),
      questionIndex: 0,
    }),
    [description, imageSrc, nodeId, questions],
  )

  const [state, setState] = useState<PreviewState>(() => initialState)
  const [currentPin, setCurrentPin] = useState<CurrentPin | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, ImagePinSubmission>>({})
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({})
  const [earnedScore, setEarnedScore] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [resolvedSession, setResolvedSession] = useState<ResolvedSession | null>(null)
  const [naturalSize, setNaturalSize] = useState<ImageNaturalSize | null>(null)
  const advanceTimeoutRef = useRef<number | null>(null)
  const wrongFreezeTimeoutRef = useRef<number | null>(null)
  const msgSeqRef = useRef(0)

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }

  const clearWrongFreezeTimeout = () => {
    if (wrongFreezeTimeoutRef.current !== null) {
      window.clearTimeout(wrongFreezeTimeoutRef.current)
      wrongFreezeTimeoutRef.current = null
    }
  }

  // Reset everything when the active node/image swap presents a fresh game.
  useEffect(() => {
    clearAdvanceTimeout()
    clearWrongFreezeTimeout()
    setState(initialState)
    setIsSessionComplete(false)
    setCurrentPin(null)
    setSubmissions({})
    setAttemptCounts({})
    setEarnedScore(0)
    setResolvedSession(null)
    msgSeqRef.current = 0
  }, [initialState])

  // Cancel pending timers on unmount.
  useEffect(() => {
    return () => {
      clearAdvanceTimeout()
      clearWrongFreezeTimeout()
    }
  }, [])

  // Preload the source image to learn its natural size — the rect lives in natural pixel space.
  useEffect(() => {
    setNaturalSize(null)
    if (!imageSrc) return
    let cancelled = false
    loadImageNaturalSize(imageSrc)
      .then((size) => {
        if (!cancelled) setNaturalSize(size)
      })
      .catch(() => {
        // Leaving naturalSize null disables correctness checks so we
        // fail closed rather than mark random answers correct.
      })
    return () => {
      cancelled = true
    }
  }, [imageSrc])

  const latestQuestionMessageId = useMemo(() => {
    for (let i = state.messages.length - 1; i >= 0; i--) {
      const m = state.messages[i]
      if (m.direction === 'incoming' && m.image) return m.id
    }
    return null
  }, [state.messages])

  // Resolve the question from the currently-latest message, not from
  // questionIndex — the indexes diverge once we've answered the last one.
  const latestQuestionFromMessage = useMemo(() => {
    if (!latestQuestionMessageId) return null
    const idx = getQuestionIndexFromMessageId(latestQuestionMessageId)
    if (idx == null) return null
    return questions[idx] ?? null
  }, [latestQuestionMessageId, questions])

  const latestSubmission = latestQuestionMessageId
    ? (submissions[latestQuestionMessageId] ?? null)
    : null
  const isLatestSubmitted = latestSubmission !== null
  const hasActiveQuestion = latestQuestionFromMessage !== null && !isLatestSubmitted

  useEffect(() => {
    if (hasActiveQuestion) setCurrentPin(null)
  }, [latestQuestionMessageId, hasActiveQuestion])

  const displayMessages = useMemo<GameChatHistoryMessage[]>(() => {
    if (!latestQuestionMessageId || isLatestSubmitted) return state.messages
    return state.messages.map((m) =>
      m.id === latestQuestionMessageId && m.image
        ? { ...m, image: { ...m.image, droppableId: PIN_IMAGE_DROPPABLE_ID } }
        : m,
    )
  }, [state.messages, latestQuestionMessageId, isLatestSubmitted])

  const getSubmissionForMessage = (message: GameChatHistoryMessage): ImagePinSubmission | null => {
    return submissions[message.id] ?? null
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (isLatestSubmitted) return // pin is locked once the active question is submitted
    const overId = event.over?.id
    if (overId === PIN_SOURCE_DROPPABLE_ID) {
      setCurrentPin(null)
      return
    }
    if (overId !== PIN_IMAGE_DROPPABLE_ID) return

    const overRect = event.over?.rect
    const dragged = event.active.rect.current.translated
    if (!overRect || !dragged) return

    const centerX = dragged.left + dragged.width / 2
    const centerY = dragged.top + dragged.height / 2

    setCurrentPin({
      drop: {
        x: clamp01((centerX - overRect.left) / overRect.width),
        y: clamp01((centerY - overRect.top) / overRect.height),
      },
      bounds: {
        left: (dragged.left - overRect.left) / overRect.width,
        top: (dragged.top - overRect.top) / overRect.height,
        right: (dragged.right - overRect.left) / overRect.width,
        bottom: (dragged.bottom - overRect.top) / overRect.height,
      },
    })
  }

  const appendReceivingMessage = (text: string) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, buildPreviewAnswerMessage(text, nodeId, prev.questionIndex)],
    }))
  }

  const handleSubmitAnswer = () => {
    if (!hasActiveQuestion || !latestQuestionFromMessage) {
      appendReceivingMessage(submitAnswerPrompt)
      return
    }
    if (!currentPin || !naturalSize) {
      appendReceivingMessage(submitAnswerPrompt)
      return
    }

    const variant = evaluatePinSubmission(
      currentPin.bounds,
      latestQuestionFromMessage.rect,
      naturalSize.width,
      naturalSize.height,
    )

    const questionId = latestQuestionFromMessage.id
    const msgId = latestQuestionMessageId! // non-null: hasActiveQuestion guarantees a latest message
    const prevAttempts = attemptCounts[questionId] ?? 0
    const thisAttempt = prevAttempts + 1
    const isLastAttempt = thisAttempt >= MAX_ATTEMPTS
    const isCorrect = variant === 'correct'
    const isSettled = isCorrect || isLastAttempt

    setAttemptCounts((prev) => ({ ...prev, [questionId]: thisAttempt }))

    if (isSettled) {
      const hasNextQuestion = state.questionIndex + 1 < questions.length
      const earned = isCorrect
        ? calcAttemptPoints(pointsPerQuestion, thisAttempt, deductionPercent, MAX_ATTEMPTS)
        : 0
      const nextScore = earnedScore + earned

      if (isCorrect) {
        setEarnedScore((prev) => prev + earned)
        if (!suppressPerAnswerConfetti) {
          fireImagePinPreviewConfetti()
        }
      }

      setSubmissions((prev) => ({ ...prev, [msgId]: { drop: currentPin.drop, variant } }))

      const settleSeq = ++msgSeqRef.current

      setState((prev) => {
        const nextQuestionIndex = prev.questionIndex + 1
        return {
          questionIndex: nextQuestionIndex,
          messages: [
            ...prev.messages,
            {
              id: `preview-${nodeId}-answer-seq-${settleSeq}`,
              text: submitAnswerPrompt,
              time: formatPreviewChatTime(),
              direction: 'receiving' as const,
            },
            buildPreviewLoadingMessage(nodeId, nextQuestionIndex),
          ],
        }
      })

      setCurrentPin(null)
      clearAdvanceTimeout()

      if (!hasNextQuestion) {
        setResolvedSession({
          score: nextScore,
          shouldCelebrate: isCorrect,
        })
      }

      if (isCorrect) {
        // Phase 1 — replace loading with "+X pts" at T=500ms
        advanceTimeoutRef.current = window.setTimeout(() => {
          const pointsSeq = ++msgSeqRef.current
          setState((prev) => {
            const loadingId = `preview-${nodeId}-loading-${prev.questionIndex}`
            const withoutLoading = prev.messages.filter((m) => m.id !== loadingId)
            return {
              ...prev,
              messages: [
                ...withoutLoading,
                buildPointsEarnedMessage(nodeId, pointsSeq, formatPointsEarned(earned)),
              ],
            }
          })

          // Phase 2 — show next question at T=500+1500=2000ms
          advanceTimeoutRef.current = window.setTimeout(() => {
            advanceTimeoutRef.current = null
            setState((prev) => {
              const nextQuestion = questions[prev.questionIndex]
              if (!nextQuestion) {
                setIsSessionComplete(true)
                return prev
              }
              return {
                ...prev,
                messages: [
                  ...prev.messages,
                  buildPreviewQuestionMessage(nodeId, imageSrc, nextQuestion, prev.questionIndex),
                ],
              }
            })
          }, NEXT_QUESTION_DELAY_MS)
        }, POINTS_REVEAL_DELAY_MS)
      } else {
        // Wrong final attempt — reveal 0 points before moving to the next question.
        advanceTimeoutRef.current = window.setTimeout(() => {
          const pointsSeq = ++msgSeqRef.current
          setState((prev) => {
            const loadingId = `preview-${nodeId}-loading-${prev.questionIndex}`
            const withoutLoading = prev.messages.filter((m) => m.id !== loadingId)
            return {
              ...prev,
              messages: [
                ...withoutLoading,
                buildPointsEarnedMessage(nodeId, pointsSeq, formatPointsEarned(0)),
              ],
            }
          })

          advanceTimeoutRef.current = window.setTimeout(() => {
            advanceTimeoutRef.current = null
            setState((prev) => {
              const nextQuestion = questions[prev.questionIndex]
              if (!nextQuestion) {
                setIsSessionComplete(true)
                return prev
              }
              return {
                ...prev,
                messages: [
                  ...prev.messages,
                  buildPreviewQuestionMessage(nodeId, imageSrc, nextQuestion, prev.questionIndex),
                ],
              }
            })
          }, NEXT_QUESTION_DELAY_MS)
        }, POINTS_REVEAL_DELAY_MS)
      }
    } else {
      // Wrong + retries remaining:
      // Lock pin at submitted position permanently. After WRONG_FREEZE_DELAY_MS, show retry question.
      const remaining = MAX_ATTEMPTS - thisAttempt
      const seq = ++msgSeqRef.current
      const questionForRetry = latestQuestionFromMessage

      setSubmissions((prev) => ({ ...prev, [msgId]: { drop: currentPin.drop, variant } }))

      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: `preview-${nodeId}-answer-seq-${seq}`,
            text: submitAnswerPrompt,
            time: formatPreviewChatTime(),
            direction: 'receiving' as const,
          },
        ],
      }))

      clearWrongFreezeTimeout()
      wrongFreezeTimeoutRef.current = window.setTimeout(() => {
        wrongFreezeTimeoutRef.current = null
        const retrySeq = ++msgSeqRef.current

        setCurrentPin(null)

        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            buildWrongRetryMessage(
              nodeId,
              retrySeq,
              t('imagePinGamePreview.wrongRetryMessage', { remaining }),
            ),
            buildPreviewRetryQuestionMessage(
              nodeId,
              imageSrc,
              questionForRetry,
              prev.questionIndex,
              thisAttempt,
            ),
          ],
        }))
      }, WRONG_FREEZE_DELAY_MS)
    }
  }

  const handleChatInput = (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return
    appendReceivingMessage(trimmed)
  }

  const handleHowToPlay = () => {
    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        buildPreviewAnswerMessage(howToPlayPrompt, nodeId, prev.questionIndex),
        buildAssistantReplyMessage(howToPlayResponse, nodeId, prev.messages.length),
      ],
    }))
  }

  const handlePromptClick = (message: string) => {
    if (message === submitAnswerPrompt) {
      handleSubmitAnswer()
      return
    }
    if (message === howToPlayPrompt) {
      handleHowToPlay()
      return
    }
    handleChatInput(message)
  }

  const pinAtSource = hasActiveQuestion && currentPin === null

  return {
    displayMessages,
    handleDragEnd,
    handlePromptClick,
    submitAnswerPrompt,
    howToPlayPrompt,
    pinAtSource,
    currentPin,
    hasActiveQuestion,
    getSubmissionForMessage,
    latestQuestionMessageId,
    earnedScore,
    resolvedSession,
    isSessionComplete,
  }
}
