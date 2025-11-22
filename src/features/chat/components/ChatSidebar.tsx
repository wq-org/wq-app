import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Chat } from '../types/chat.types';

interface ChatSidebarProps {
    chats: Chat[];
    selectedChatId?: string;
    onChatSelect: (chatId: string) => void;
}

export function ChatSidebar({
    chats,
    selectedChatId,
    onChatSelect,
}: ChatSidebarProps) {
    // Limit to max 6 entries
    const displayChats = chats.slice(0, 6);

    return (
        <div className="fixed left-4 top-4 w-64 h-[600px] z-10">
            <Card className="h-full flex flex-col p-2 rounded-xl backdrop-blur-md bg-background/80 border">
                <ScrollArea className="flex-1">
                    <div className="space-y-2">
                        {displayChats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => onChatSelect(chat.id)}
                                className={cn(
                                    'w-full text-left p-3 rounded-lg transition-colors hover:bg-accent',
                                    selectedChatId === chat.id && 'bg-accent'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
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
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {chat.user.name}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
}
