import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Previous Chats</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chats.map((chat) => (
                                <SidebarMenuItem key={chat.id}>
                                    <SidebarMenuButton
                                        onClick={() => onChatSelect(chat.id)}
                                        className={cn(
                                            'w-full justify-start gap-3 h-auto py-3',
                                            selectedChatId === chat.id && 'bg-accent'
                                        )}
                                    >
                                        <div className="relative">
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
                                            {chat.user.isOnline && (
                                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-medium truncate">
                                                    {chat.user.name}
                                                </p>
                                                {chat.unreadCount > 0 && (
                                                    <Badge
                                                        variant="default"
                                                        className="h-5 min-w-5 px-1.5 text-xs"
                                                    >
                                                        {chat.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                            {chat.lastMessage && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    {chat.lastMessage.content}
                                                </p>
                                            )}
                                            {chat.lastMessage && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {chat.updatedAt}
                                                </p>
                                            )}
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

