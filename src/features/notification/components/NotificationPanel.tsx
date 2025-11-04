import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationItem from './NotificationItem';
import type { Notification } from '../types/notification.types';
import { mockNotifications } from '../data/mockNotifications';

export default function NotificationPanel() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [activeTab, setActiveTab] = useState<'all' | 'following' | 'archive'>('all');

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    return (
        <div className="w-full rounded-2xl backdrop-blur bg-card/70 border shadow-md">
            {/* Header */}
            <div className="p-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-light text-gray-900">Notifications</h1>
                    <Button
                        variant="ghost"
                        onClick={handleMarkAllAsRead}
                        className="text-sm underline hover:no-underline"
                    >
                        Mark all as read
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`relative pb-2 text-base font-medium transition-colors ${
                            activeTab === 'all'
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            All
                            {unreadCount > 0 && (
                                <Badge variant="default" className="rounded-full px-2">
                                    {unreadCount}
                                </Badge>
                            )}
                        </div>
                        {activeTab === 'all' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('following')}
                        className={`relative pb-2 text-base font-medium transition-colors ${
                            activeTab === 'following'
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            Following
                            <span className="text-sm text-gray-400">6</span>
                        </div>
                        {activeTab === 'following' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`relative pb-2 text-base font-medium transition-colors ${
                            activeTab === 'archive'
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Archive
                        {activeTab === 'archive' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                        )}
                    </button>

                    <div className="ml-auto">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Settings className="h-5 w-5 text-gray-400" />
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Notification List */}
            <ScrollArea className="max-h-[500px]">
                {activeTab === 'all' && (
                    <div>
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-gray-500 text-lg">No notifications</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    You're all caught up!
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'following' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-gray-500 text-lg">No following notifications</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Notifications from people you follow will appear here
                        </p>
                    </div>
                )}

                {activeTab === 'archive' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-gray-500 text-lg">No archived notifications</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Archived notifications will appear here
                        </p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

