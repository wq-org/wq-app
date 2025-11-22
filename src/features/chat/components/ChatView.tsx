import { useState, useEffect, useRef } from 'react';
import { CornerDownLeft, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from '@/components/ui/input-group';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { ChatMessage } from './ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Chat, ChatMessage as ChatMessageType } from '../types/chat.types';

interface ChatViewProps {
    chat: Chat | null;
    messages: ChatMessageType[];
    currentUserId: string;
    onSendMessage: (content: string) => void;
}

export function ChatView({
    chat,
    messages,
    currentUserId,
    onSendMessage,
}: ChatViewProps) {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                200
            )}px`;
        }
    }, [messageInput]);

    if (!chat) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a chat to start messaging</p>
            </div>
        );
    }

    const handleSend = () => {
        if (messageInput.trim()) {
            onSendMessage(messageInput.trim());
            setMessageInput('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageInput(e.target.value);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="border-b p-4 flex items-center gap-3 shrink-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                    <AvatarFallback>
                        {chat.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-medium">{chat.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {chat.user.email}
                    </p>
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
                    <PopoverContent className="w-48 p-2" align="end">
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
            <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                    <div className="space-y-1">
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                isOwnMessage={message.senderId === currentUserId}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input - Always at bottom */}
            <div className="border-t p-4 shrink-0 bg-background">
                <InputGroup>
                    <InputGroupTextarea
                        ref={textareaRef}
                        placeholder="Type your message here..."
                        value={messageInput}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        className="min-h-[80px] max-h-[200px] overflow-y-auto"
                    />
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            variant="default"
                            size="sm"
                            onClick={handleSend}
                            disabled={!messageInput.trim()}
                            aria-label="Send message"
                        >
                            Send <CornerDownLeft className="h-4 w-4" />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        </div>
    );
}

