import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import confetti from 'canvas-confetti'
import type { GameChatHistoryMessage } from '../../components/game-chat.types'
import type { GameImagePinNodeData, GameImagePinRect } from './game-image-pin.schema'
import { loadImageNaturalSize } from './imagePinRectGeometry'
import {
  evaluatePinSubmission,
  type ImagePinSubmissionVariant,
  type NormalizedPinBounds,
  type NormalizedPinPoint,
} from './gameImagePinValidation'

export const PIN_SOURCE_DROPPABLE_ID = 'pin-source'
export const PIN_IMAGE_DROPPABLE_ID = 'image-pin-target'
export const PIN_DRAGGABLE_ID = 'image-pin'
export const SUBMIT_ANSWER_PROMPT =
  'I placed the pin on the image. Please check my answer and tell me if it is correct.'

export const HOW_TO_PLAY_PROMPT =
  'Explain how to play this game. Tell me how to answer the question by dragging the pin to the correct place on the image.'

const HOW_TO_PLAY_RESPONSE = [
  "Here's how to play:",
  '',
  '1. Read the question shown above the image.',
  '2. Drag the pin from the slot below onto the image.',
  '3. Position it so the whole pin sits inside the highlighted rectangle.',
  '4. Click "Submit Answer" to lock your placement.',
  '5. Correct answers turn the pin blue with confetti; misses turn it red.',
  '6. The next question loads after a short pause.',
  '',
  'Tip: you can drag the pin back to the slot any time before you submit.',
].join('\n')

const NEXT_QUESTION_DELAY_MS = 3000

export type PreviewQuestion = {
  id: string
  question: string
  rect: GameImagePinRect
}

export type ImagePinSubmission = {
  drop: NormalizedPinPoint
  variant: ImagePinSubmissionVariant
}

export type UseGameImagePinGameArgs = {
  nodeId: string
  nodeData: GameImagePinNodeData
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

function buildInitialPreviewMessages(
  nodeId: string,
  imageSrc: string,
  questions: PreviewQuestion[],
): GameChatHistoryMessage[] {
  const first = questions[0]
  if (!first) return []
  return [buildPreviewQuestionMessage(nodeId, imageSrc, first, 0)]
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

function fireCorrectConfetti(): void {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  })
}

export function useGameImagePinGame({ nodeId, nodeData }: UseGameImagePinGameArgs) {
  const imageSrc = getPreviewImageSrc(nodeData)
  const questions = useMemo(() => getPreviewQuestions(nodeData), [nodeData])

  const initialState = useMemo<PreviewState>(
    () => ({
      messages: buildInitialPreviewMessages(nodeId, imageSrc, questions),
      questionIndex: 0,
    }),
    [imageSrc, nodeId, questions],
  )

  const [state, setState] = useState<PreviewState>(() => initialState)
  const [currentPin, setCurrentPin] = useState<CurrentPin | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, ImagePinSubmission>>({})
  const [naturalSize, setNaturalSize] = useState<ImageNaturalSize | null>(null)
  const advanceTimeoutRef = useRef<number | null>(null)

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }

  // Reset everything when the active node/image swap presents a fresh game.
  useEffect(() => {
    clearAdvanceTimeout()
    setState(initialState)
    setCurrentPin(null)
    setSubmissions({})
  }, [initialState])

  // Cancel any pending "next question" timer if the component unmounts.
  useEffect(() => {
    return () => clearAdvanceTimeout()
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

  // Resolve the question id from the currently-latest message, not from
  // questionIndex — the indexes diverge once we've answered the last one.
  const latestQuestionFromMessage = useMemo(() => {
    if (!latestQuestionMessageId) return null
    const idx = getQuestionIndexFromMessageId(latestQuestionMessageId)
    if (idx == null) return null
    return questions[idx] ?? null
  }, [latestQuestionMessageId, questions])

  const latestSubmission = latestQuestionFromMessage
    ? (submissions[latestQuestionFromMessage.id] ?? null)
    : null
  const isLatestSubmitted = latestSubmission !== null
  const hasActiveQuestion = latestQuestionFromMessage !== null && !isLatestSubmitted

  // Drop the pin back to source whenever a new (unsubmitted) question becomes latest.
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
    const idx = getQuestionIndexFromMessageId(message.id)
    if (idx == null) return null
    const question = questions[idx]
    if (!question) return null
    return submissions[question.id] ?? null
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
      appendReceivingMessage(SUBMIT_ANSWER_PROMPT)
      return
    }
    if (!currentPin || !naturalSize) {
      appendReceivingMessage(SUBMIT_ANSWER_PROMPT)
      return
    }

    const variant = evaluatePinSubmission(
      currentPin.bounds,
      latestQuestionFromMessage.rect,
      naturalSize.width,
      naturalSize.height,
    )

    const questionId = latestQuestionFromMessage.id
    setSubmissions((prev) => ({
      ...prev,
      [questionId]: { drop: currentPin.drop, variant },
    }))

    if (variant === 'correct') fireCorrectConfetti()

    setState((prev) => {
      const nextQuestionIndex = prev.questionIndex + 1
      return {
        questionIndex: nextQuestionIndex,
        messages: [
          ...prev.messages,
          buildPreviewAnswerMessage(SUBMIT_ANSWER_PROMPT, nodeId, prev.questionIndex),
          buildPreviewLoadingMessage(nodeId, nextQuestionIndex),
        ],
      }
    })

    setCurrentPin(null)

    // After a brief "thinking" pause, swap the loading bubble for the next
    // question (or just drop the loader if this was the final question).
    clearAdvanceTimeout()
    advanceTimeoutRef.current = window.setTimeout(() => {
      advanceTimeoutRef.current = null
      setState((prev) => {
        const loadingId = `preview-${nodeId}-loading-${prev.questionIndex}`
        const withoutLoading = prev.messages.filter((m) => m.id !== loadingId)
        const nextQuestion = questions[prev.questionIndex]
        const nextMessages = nextQuestion
          ? [
              ...withoutLoading,
              buildPreviewQuestionMessage(nodeId, imageSrc, nextQuestion, prev.questionIndex),
            ]
          : withoutLoading
        return { ...prev, messages: nextMessages }
      })
    }, NEXT_QUESTION_DELAY_MS)
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
        buildPreviewAnswerMessage(HOW_TO_PLAY_PROMPT, nodeId, prev.questionIndex),
        buildAssistantReplyMessage(HOW_TO_PLAY_RESPONSE, nodeId, prev.messages.length),
      ],
    }))
  }

  const handlePromptClick = (message: string) => {
    if (message === SUBMIT_ANSWER_PROMPT) {
      handleSubmitAnswer()
      return
    }
    if (message === HOW_TO_PLAY_PROMPT) {
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
    handleChatInput,
    pinAtSource,
    currentPin,
    getSubmissionForMessage,
    latestQuestionMessageId,
  }
}
