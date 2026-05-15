import { useEffect, useState } from 'react'
import { Ai02, type Ai02PromptSuggestion } from '@/components/shared/ai-components'
import { ChatHistory, type ChatHistoryMessage } from '@/components/shared/chat'
import { Text } from '@/components/ui/text'
import { Check, MessageCircle, HandHelping } from 'lucide-react'

export type GameImagePinPreviewProps = {
  nodeId: string
}

const previewChatSeedMessages: ChatHistoryMessage[] = [
  {
    id: 'demo-default-blue-in-1',
    text: 'Incoming with one image (rendered via ChatImageList).',
    time: '10:22',
    direction: 'incoming',
    images: [
      {
        src: 'https://is1-ssl.mzstatic.com/image/thumb/D7jPY10jdztPWqX8fx4CaQ/2400x1350sr.webp',
        alt: 'MacBook Neo — highlights, AI',
      },
    ],
  },
  {
    id: 'demo-default-blue-out-1',
    text: 'Receiving message — right side.',
    time: '10:23',
    direction: 'receiving',
  },
  {
    id: 'demo-default-blue-out-1e33',
    text: 'Receiving message — right side.',
    time: '10:23',
    direction: 'receiving',
  },
  {
    id: 'default-blue-out-1e33',
    text: 'Receiving message — right side.',
    time: '10:23',
    direction: 'receiving',
  },
  {
    id: 'demo-default-blue-in-2',
    text: 'Another incoming line for contrast.',
    time: '10:24',
    direction: 'incoming',
  },
]

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

function clonePreviewChatSeed(): ChatHistoryMessage[] {
  return previewChatSeedMessages.map((message) => ({ ...message }))
}

function formatPreviewChatTime(date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function buildPreviewUserMessage(text: string): ChatHistoryMessage {
  return {
    id: `preview-user-${crypto.randomUUID()}`,
    text,
    time: formatPreviewChatTime(),
    direction: 'receiving',
  }
}

export function GameImagePinPreview({ nodeId }: GameImagePinPreviewProps) {
  const [messages, setMessages] = useState<ChatHistoryMessage[]>(clonePreviewChatSeed)

  useEffect(() => {
    setMessages(clonePreviewChatSeed())
  }, [nodeId])

  const handleSubmit = (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, buildPreviewUserMessage(trimmed)])
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
        messages={messages}
        className="h-[390px]"
        incomingBubbleVariant="default"
        receivingBubbleVariant="blue"
      />

      <Ai02
        prompts={prompts}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
