import { useEffect, useMemo, useState } from 'react'
import {
  Ai01,
  AiPromptBadgeList,
  type Ai02PromptSuggestion,
} from '@/components/shared/ai-components'
import { Text } from '@/components/ui/text'
import { Check, HandHelping, CircleQuestionMark } from 'lucide-react'
import { useUser } from '@/contexts/user'
import { useAvatarUrl } from '@/hooks/useAvatarUrl'
import { GameChatHistory } from '../../components/GameChatHistory'
import type { GameChatHistoryMessage } from '../../components/game-chat.types'
import type { GameImagePinNodeData, GameImagePinRect } from './game-image-pin.schema'
import { ImagePin } from './ImagePin'
import { DndContext, useDraggable } from '@dnd-kit/core'

export type GameImagePinPreviewProps = {
  nodeId: string
  nodeData: GameImagePinNodeData
}

type PreviewQuestion = {
  id: string
  question: string
  rect: GameImagePinRect
}

const prompts = [
  {
    icon: Check,
    text: 'Submit Answer',
    prompt: 'I placed the pin on the image. Please check my answer and tell me if it is correct.',
  },
  {
    icon: HandHelping,
    text: 'Give me a hint',
    prompt:
      'Give me a helpful hint for where I should place the pin, but do not reveal the full answer.',
  },
  {
    icon: CircleQuestionMark,
    text: 'how to play the game',
    prompt:
      'Explain how to play this game. Tell me how to answer the question by dragging the pin to the correct place on the image.',
  },
] as const satisfies readonly Ai02PromptSuggestion[]

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

function buildInitialPreviewMessages(
  nodeId: string,
  imageSrc: string,
  questions: PreviewQuestion[],
): GameChatHistoryMessage[] {
  const firstQuestion = questions[0]
  if (!firstQuestion) return []
  return [buildPreviewQuestionMessage(nodeId, imageSrc, firstQuestion, 0)]
}

type PreviewState = {
  messages: GameChatHistoryMessage[]
  questionIndex: number
}

function DraggablePin() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'image-pin',
  })

  return (
    <div className="w-full flex justify-center">
      <ImagePin
        ref={setNodeRef}
        style={{
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        }}
        {...listeners}
        {...attributes}
      />
    </div>
  )
}

export function GameImagePinPreview({ nodeId, nodeData }: GameImagePinPreviewProps) {
  const { profile } = useUser()
  const { url: userAvatarUrl } = useAvatarUrl(profile?.avatar_url ?? null)
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

  useEffect(() => {
    setState(initialState)
  }, [initialState])

  const handleSubmit = (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return
    setState((prev) => {
      const nextMessages = [
        ...prev.messages,
        buildPreviewAnswerMessage(trimmed, nodeId, prev.questionIndex),
      ]
      const nextQuestionIndex = prev.questionIndex + 1
      const nextQuestion = questions[nextQuestionIndex]
      if (nextQuestion) {
        nextMessages.push(
          buildPreviewQuestionMessage(nodeId, imageSrc, nextQuestion, nextQuestionIndex),
        )
      }

      return {
        messages: nextMessages,
        questionIndex: nextQuestionIndex,
      }
    })
  }

  const handlePromptClick = (message: string) => {
    handleSubmit(message)
  }

  return (
    <div className="flex flex-col gap-8">
      <Text
        as="p"
        variant="small"
        color="orange"
      >
        You are in preview mode. This test view shows how the game component will look and behave
        during real play.
      </Text>

      <GameChatHistory
        messages={state.messages}
        className="h-[390px]"
        showUserAvatar
        incomingAvatarUrl={userAvatarUrl ?? undefined}
        incomingBubbleVariant="orange"
        receivingBubbleVariant="default"
      />

      <DndContext>
        <DraggablePin />
      </DndContext>

      <AiPromptBadgeList
        prompts={prompts}
        onPromptClick={handlePromptClick}
      />

      <Ai01
        placeholder="Submit your answer"
        showDropDown={false}
        showMic={false}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
