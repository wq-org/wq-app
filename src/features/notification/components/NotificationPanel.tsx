import { useState, useMemo } from 'react'
import { Bell, User, GraduationCap } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import SelectTabs from '@/components/shared/tabs/SelectTabs'
import NotificationItem from './NotificationItem'
import type { Notification, NotificationAction } from '../types/notification.types'
import { mockNotifications } from '../data/mockNotifications'
import { useTranslation } from 'react-i18next'

type TabId = 'all' | 'users' | 'course'

function getAction(n: Notification): NotificationAction | undefined {
  if (n.action) return n.action
  if (n.type === 'follow') return 'follow'
  if (n.type === 'join') return 'join_course'
  return undefined
}

function filterByTab(notifications: Notification[], tab: TabId): Notification[] {
  if (tab === 'all') return notifications
  if (tab === 'users') return notifications.filter((n) => getAction(n) === 'follow')
  if (tab === 'course') return notifications.filter((n) => getAction(n) === 'join_course')
  return notifications
}

export default function NotificationPanel() {
  const { t } = useTranslation('features.notification')
  const [notifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState<TabId>('all')

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filtered = useMemo(
    () => filterByTab(notifications, activeTab),
    [notifications, activeTab],
  )
  const usersCount = notifications.filter((n) => getAction(n) === 'follow').length
  const courseCount = notifications.filter((n) => getAction(n) === 'join_course').length

  const emptyMessage: Record<TabId, { title: string; description: string }> = {
    all: { title: t('panel.emptyAll.title'), description: t('panel.emptyAll.description') },
    users: { title: t('panel.emptyUsers.title'), description: t('panel.emptyUsers.description') },
    course: { title: t('panel.emptyCourse.title'), description: t('panel.emptyCourse.description') },
  }

  const notificationTabs = useMemo(
    () => [
      {
        id: 'all',
        icon: Bell,
        title: unreadCount > 0 ? `${t('panel.tabs.all')} ${unreadCount}` : t('panel.tabs.all'),
      },
      {
        id: 'users',
        icon: User,
        title: usersCount > 0 ? `${t('panel.tabs.users')} ${usersCount}` : t('panel.tabs.users'),
      },
      {
        id: 'course',
        icon: GraduationCap,
        title: courseCount > 0 ? `${t('panel.tabs.course')} ${courseCount}` : t('panel.tabs.course'),
      },
    ],
    [t, unreadCount, usersCount, courseCount],
  )

  return (
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
          <Text as="h1" variant="h1" className="text-xl text-gray-900">
            {t('panel.title')}
          </Text>
        </div>
        <SelectTabs
          tabs={notificationTabs}
          activeTabId={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as TabId)}
          variant="compact"
        />
      </div>

      <Separator />

      {/* Notification List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full max-h-full">
          <div className="animate-in fade-in-0 slide-in-from-bottom-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Text as="p" variant="body" className="text-gray-500 text-base">
                  {emptyMessage[activeTab].title}
                </Text>
                <Text as="p" variant="body" className="text-gray-400 text-sm mt-1">
                  {emptyMessage[activeTab].description}
                </Text>
              </div>
            ) : (
              filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
