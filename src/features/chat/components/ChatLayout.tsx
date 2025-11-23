import { useState } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { ChatView } from './ChatView'
import { mockChats, getMessagesForChat } from '../data/mockChatData'
import type { ChatMessage } from '../types/chat.types'

export function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(mockChats[0]?.id)
  const messages: Record<string, ChatMessage[]> = (() => {
    const initialMessages: Record<string, ChatMessage[]> = {}
    mockChats.forEach((chat) => {
      initialMessages[chat.id] = getMessagesForChat(chat.id)
    })
    return initialMessages
  })()

  const selectedChat = mockChats.find((chat) => chat.id === selectedChatId)
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : []

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId)
  }

  return (
    <div className="h-screen w-[90%] bg-[#eee] rounded-2xl">
      <ChatSidebar
        chats={mockChats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
      />
      <div className="ml-[280px] h-full">
        <ChatView
          chat={selectedChat || null}
          messages={currentMessages}
          currentUserId="current-user"
        />
      </div>
    </div>
  )
}
