import { useEffect, useState } from 'react'
import { Ai02, type Ai02PromptSuggestion } from '@/components/shared/ai-components'
import { ChatHistory, type ChatHistoryMessage } from '@/components/shared/chat'
import { Text } from '@/components/ui/text'
import { Check, MessageCircle, HandHelping } from 'lucide-react'
import type { GameImagePinNodeData } from './game-image-pin.schema'

export type GameImagePinPreviewProps = {
  nodeId: string
  nodeData: GameImagePinNodeData
}

const prompts = [
  {
    icon: Check,
    text: 'Submit Answer',
    prompt: 'Submit Answer now!',
  },
  {
    icon: HandHelping,
    text: 'Give me a hint',
    prompt: 'I need help ? ',
  },
  {
    icon: MessageCircle,
    text: 'how to play the game',
    prompt:
      'Scan through the codebase to identify and fix 3 critical bugs, providing detailed explanations for each fix.',
  },
] as const satisfies readonly Ai02PromptSuggestion[]

type PreviewQuestion = {
  id: string
  question: string
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
    return [{ id: rect.id, question }]
  })
}

function buildPreviewQuestionMessage(
  nodeId: string,
  imageSrc: string,
  question: PreviewQuestion,
  index: number,
): ChatHistoryMessage {
  return {
    id: `preview-${nodeId}-question-${index}-${question.id}`,
    text: question.question,
    time: formatPreviewChatTime(),
    direction: 'incoming',
    images: imageSrc
      ? [
          {
            src: imageSrc,
            alt: 'Game Image Pin preview image',
          },
        ]
      : undefined,
  }
}

function buildPreviewAnswerMessage(
  text: string,
  nodeId: string,
  index: number,
): ChatHistoryMessage {
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
): ChatHistoryMessage[] {
  const firstQuestion = questions[0]
  if (!firstQuestion) return []
  return [buildPreviewQuestionMessage(nodeId, imageSrc, firstQuestion, 0)]
}

type PreviewState = {
  messages: ChatHistoryMessage[]
  questionIndex: number
}

function buildResetKey(nodeId: string, imageSrc: string, questions: PreviewQuestion[]): string {
  return [
    nodeId,
    imageSrc,
    ...questions.map((question) => `${question.id}:${question.question}`),
  ].join('::')
}

export function GameImagePinPreview({ nodeId, nodeData }: GameImagePinPreviewProps) {
  const imageSrc = getPreviewImageSrc(nodeData)
  const questions = getPreviewQuestions(nodeData)
  const resetKey = buildResetKey(nodeId, imageSrc, questions)

  const [state, setState] = useState<PreviewState>(() => ({
    messages: buildInitialPreviewMessages(nodeId, imageSrc, questions),
    questionIndex: 0,
  }))

  useEffect(() => {
    setState({
      messages: buildInitialPreviewMessages(nodeId, imageSrc, questions),
      questionIndex: 0,
    })
  }, [resetKey])

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

      <ChatHistory
        messages={state.messages}
        className="h-[390px]"
        incomingBubbleVariant="dark"
        receivingBubbleVariant="blue"
      />

      <Ai02
        prompts={prompts}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
