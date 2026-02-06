import { MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ChatMessage } from './ChatMessage'
import type { Chat, ChatMessage as ChatMessageType } from '../types/chat.types'
import { Text } from '@/components/ui/text'

interface ChatViewProps {
  chat: Chat | null
  messages: ChatMessageType[]
  currentUserId: string
}

export function ChatView({ chat, messages, currentUserId }: ChatViewProps) {
  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Text as="p" variant="body">Select a chat to start messaging</Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3 shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={chat.user.avatar}
            alt={chat.user.name}
          />
          <AvatarFallback>
            {chat.user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Text as="p" variant="body" className="font-medium">{chat.user.name}</Text>
          <Text as="p" variant="body" className="text-sm text-muted-foreground">{chat.user.email}</Text>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-2"
            align="end"
          >
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent">
                View Profile
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent">
                Mute Notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}