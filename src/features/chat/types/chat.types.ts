export interface ChatUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

export interface ChatMessage {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface Chat {
    id: string;
    userId: string;
    user: ChatUser;
    lastMessage?: ChatMessage;
    unreadCount: number;
    updatedAt: string;
}

