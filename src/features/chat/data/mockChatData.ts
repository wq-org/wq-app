import type { Chat, ChatUser, ChatMessage } from '../types/chat.types';

// Mock users
export const mockUsers: ChatUser[] = [
    {
        id: '1',
        name: 'Sabrina Leons',
        email: 'sabrina.leons@example.com',
        isOnline: true,
    },
    {
        id: '2',
        name: 'Jace Martinez',
        email: 'jace.martinez@example.com',
        isOnline: false,
        lastSeen: '2 hours ago',
    },
    {
        id: '3',
        name: 'Ken Chanter',
        email: 'ken.chanter@example.com',
        isOnline: true,
    },
    {
        id: '4',
        name: 'Justin Dorwart',
        email: 'justin.dorwart@example.com',
        isOnline: false,
        lastSeen: '1 day ago',
    },
    {
        id: '5',
        name: 'Makenna Workman',
        email: 'makenna.workman@example.com',
        isOnline: true,
    },
];

// Mock messages for each chat
const mockMessages: Record<string, ChatMessage[]> = {
    '1': [
        {
            id: 'm1',
            chatId: '1',
            senderId: '1',
            content: "Wow, it's cool that you know Unity. I've used Unity in some works of mine too. What do you like about it?",
            timestamp: '2:55 PM',
            isRead: true,
        },
        {
            id: 'm2',
            chatId: '1',
            senderId: 'current-user',
            content: "Yea, I studied Unity with an XR bootcamp foundations. Afterwards did some projects with it. I would say I like how it lets me prototype my projects.",
            timestamp: '2:55 PM',
            isRead: true,
        },
        {
            id: 'm3',
            chatId: '1',
            senderId: '1',
            content: "That's great to hear. Also hey, I notice you love manga and anime. I'm a weeb myself. What's your favorite?",
            timestamp: '2:56 PM',
            isRead: true,
        },
        {
            id: 'm4',
            chatId: '1',
            senderId: 'current-user',
            content: "Oh yes! I'm currently reading One Piece! I love the adventure of it. What about you?",
            timestamp: '2:55 PM',
            isRead: true,
        },
    ],
    '2': [
        {
            id: 'm5',
            chatId: '2',
            senderId: '2',
            content: 'Hey, are you available for a quick call?',
            timestamp: '1:30 PM',
            isRead: false,
        },
    ],
    '3': [
        {
            id: 'm6',
            chatId: '3',
            senderId: 'current-user',
            content: 'Thanks for the help with the project!',
            timestamp: 'Yesterday',
            isRead: true,
        },
    ],
};

// Mock chats
export const mockChats: Chat[] = [
    {
        id: '1',
        userId: '1',
        user: mockUsers[0],
        lastMessage: mockMessages['1'][mockMessages['1'].length - 1],
        unreadCount: 0,
        updatedAt: '2:55 PM',
    },
    {
        id: '2',
        userId: '2',
        user: mockUsers[1],
        lastMessage: mockMessages['2'][0],
        unreadCount: 1,
        updatedAt: '1:30 PM',
    },
    {
        id: '3',
        userId: '3',
        user: mockUsers[2],
        lastMessage: mockMessages['3'][0],
        unreadCount: 0,
        updatedAt: 'Yesterday',
    },
    {
        id: '4',
        userId: '4',
        user: mockUsers[3],
        lastMessage: undefined,
        unreadCount: 0,
        updatedAt: '1 day ago',
    },
    {
        id: '5',
        userId: '5',
        user: mockUsers[4],
        lastMessage: undefined,
        unreadCount: 0,
        updatedAt: '2 days ago',
    },
];

export const getMessagesForChat = (chatId: string): ChatMessage[] => {
    return mockMessages[chatId] || [];
};

