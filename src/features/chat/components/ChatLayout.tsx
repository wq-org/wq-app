import { useState } from 'react';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ChatSidebar } from './ChatSidebar';
import { ChatView } from './ChatView';
import { mockChats, getMessagesForChat } from '../data/mockChatData';
import type { ChatMessage } from '../types/chat.types';

export function ChatLayout() {
    const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
        mockChats[0]?.id
    );
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
        const initialMessages: Record<string, ChatMessage[]> = {};
        mockChats.forEach((chat) => {
            initialMessages[chat.id] = getMessagesForChat(chat.id);
        });
        return initialMessages;
    });

    const selectedChat = mockChats.find((chat) => chat.id === selectedChatId);
    const currentMessages = selectedChatId
        ? messages[selectedChatId] || []
        : [];

    const handleChatSelect = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    const handleSendMessage = (content: string) => {
        if (!selectedChatId) return;

        const newMessage: ChatMessage = {
            id: `m${Date.now()}`,
            chatId: selectedChatId,
            senderId: 'current-user',
            content,
            timestamp: new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            }),
            isRead: false,
        };

        setMessages((prev) => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
        }));
    };

    return (
        <div className="h-screen w-full">
            <SidebarProvider defaultOpen={true}>
                <ChatSidebar
                    chats={mockChats}
                    selectedChatId={selectedChatId}
                    onChatSelect={handleChatSelect}
                />
                <SidebarInset className="h-full">
                    <div className="flex items-center gap-2 p-2 border-b shrink-0">
                        <SidebarTrigger />
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ChatView
                            chat={selectedChat || null}
                            messages={currentMessages}
                            currentUserId="current-user"
                            onSendMessage={handleSendMessage}
                        />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}

