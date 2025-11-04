import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Notification } from '../types/notification.types';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
    notification: Notification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
    return (
        <div
            className={cn(
                'flex gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100',
                !notification.isRead && 'bg-blue-50/30'
            )}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <Avatar className={cn('h-12 w-12', notification.avatar?.color)}>
                    {notification.avatar?.src && (
                        <AvatarImage src={notification.avatar.src} alt={notification.avatar.fallback} />
                    )}
                    <AvatarFallback className="text-sm font-medium">
                        {notification.avatar?.fallback}
                    </AvatarFallback>
                </Avatar>
                {!notification.isRead && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-gray-900 mb-1">
                    {notification.title}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                    {notification.message}
                </p>

                {/* File metadata */}
                {notification.metadata?.fileName && (
                    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg w-fit mt-2">
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                            <span className="text-lg">{notification.metadata.fileIcon || '📄'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                {notification.metadata.fileName}
                            </span>
                            {notification.metadata.fileSize && (
                                <Badge variant="secondary" className="text-xs">
                                    {notification.metadata.fileSize}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                {notification.actions && (
                    <div className="flex gap-2 mt-3">
                        {notification.actions.accept && (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    notification.actions?.accept?.();
                                }}
                                className="rounded-full"
                            >
                                Accept
                            </Button>
                        )}
                        {notification.actions.decline && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    notification.actions?.decline?.();
                                }}
                                className="rounded-full"
                            >
                                Decline
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

