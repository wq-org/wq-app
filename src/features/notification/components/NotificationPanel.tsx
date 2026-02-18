import { useState } from 'react'
import { Text } from '@/components/ui/text'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import NotificationItem from './NotificationItem'
import type { Notification } from '../types/notification.types'
import { mockNotifications } from '../data/mockNotifications'
import { useTranslation } from 'react-i18next'

export default function NotificationPanel() {
  const { t } = useTranslation('features.notification')
  const [notifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all')

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    // Make panel have fixed height and flex column, header/tabs sticky, notification list scrollable
    <div
      className="w-90 p-4 rounded-4xl backdrop-blur bg-card/70 border shadow-md flex flex-col animate-in fade-in-0 slide-in-from-right-2"
      style={{ height: 500, minHeight: 400 }}
    >
      {/* Header */}
      <div
        className="p-3 pb-1 sticky top-0 z-10 bg-card/70"
        style={{ backgroundClip: 'padding-box' }}
      >
        <div className="flex items-center justify-between mb-6">
          <Text
            as="h1"
            variant="h1"
            className="text-xl  text-gray-900"
          >
            {t('panel.title')}
          </Text>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative pb-2 text-base  transition-colors ${
              activeTab === 'all'
                ? 'text-gray-900 animate-in zoom-in-95'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {t('panel.tabs.all')}
              {unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="rounded-full px-1.5 text-xs"
                >
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
            className={`relative pb-2 text-base transition-colors ${
              activeTab === 'following'
                ? 'text-gray-900 animate-in zoom-in-95'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {t('panel.tabs.following')}
              <Text
                as="span"
                variant="small"
                className="text-xs text-gray-400"
              >
                6
              </Text>
            </div>
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        </div>
      </div>

      <Separator />

      {/* Notification List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full max-h-full">
          {activeTab === 'all' && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Text
                    as="p"
                    variant="body"
                    className="text-gray-500 text-base"
                  >
                    {t('panel.emptyAll.title')}
                  </Text>
                  <Text
                    as="p"
                    variant="body"
                    className="text-gray-400 text-sm mt-1"
                  >
                    {t('panel.emptyAll.description')}
                  </Text>
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
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in-0 slide-in-from-bottom-3">
              <Text
                as="p"
                variant="body"
                className="text-gray-500 text-base"
              >
                {t('panel.emptyFollowing.title')}
              </Text>
              <Text
                as="p"
                variant="body"
                className="text-gray-400 text-sm mt-1"
              >
                {t('panel.emptyFollowing.description')}
              </Text>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
