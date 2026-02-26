import { useState, useMemo, useEffect, useCallback } from 'react'
import { Bell, User } from 'lucide-react'
import { Text } from '@/components/ui/text'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import SelectTabs from '@/components/shared/tabs/SelectTabs'
import NotificationItem from './NotificationItem'
import type { Notification, NotificationAction } from '../types/notification.types'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  getPendingFollowRequestsForNotifications,
  respondToFollowRequest,
} from '../api/notificationRequestsApi'
import { useUser } from '@/contexts/user'

type TabId = 'all' | 'users'

interface NotificationPanelProps {
  onTotalCountChange?: (count: number) => void
}

function getAction(n: Notification): NotificationAction | undefined {
  if (n.action) return n.action
  if (n.type === 'follow') return 'follow'
  if (n.type === 'join') return 'join_course'
  return undefined
}

function filterByTab(notifications: Notification[], tab: TabId): Notification[] {
  if (tab === 'all') return notifications
  if (tab === 'users') return notifications.filter((n) => getAction(n) === 'follow')
  return notifications
}

function getNameInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function formatTimestamp(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

export default function NotificationPanel({ onTotalCountChange }: NotificationPanelProps) {
  const { t } = useTranslation('features.notification')
  const { getRole } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('all')

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) {
        setNotifications([])
        onTotalCountChange?.(0)
        return
      }
      const role = getRole()?.toLowerCase()
      const canRespondFollowRequests =
        role === 'teacher' || role === 'admin' || role === 'super_admin'

      const pendingFollowRequests = await getPendingFollowRequestsForNotifications().catch(
        (error) => {
          console.error('Failed to load follow request notifications:', error)
          return []
        },
      )

      const followerNotifications: Notification[] = pendingFollowRequests.map((request) => {
        const studentName =
          request.student?.display_name ||
          request.student?.username ||
          t('item.unknownUser', { defaultValue: 'Unknown user' })
        const notificationId = `follow-${request.teacher_id}-${request.student_id}`
        // Follow requests are accepted or declined only here (notification panel); teacher decision.
        const followActions = canRespondFollowRequests
          ? {
              accept: async () => {
                setActionLoadingId(notificationId)
                try {
                  await respondToFollowRequest(request.teacher_id, request.student_id, 'accept')
                  setNotifications((prev) => prev.filter((item) => item.id !== notificationId))
                  toast.success(
                    t('item.toasts.followAcceptSuccess', {
                      defaultValue: 'Follow request accepted.',
                    }),
                  )
                } catch (error) {
                  console.error('Failed to accept follow request:', error)
                  toast.error(
                    t('item.toasts.acceptError', { defaultValue: 'Could not accept request.' }),
                  )
                } finally {
                  setActionLoadingId(null)
                }
              },
              decline: async () => {
                setActionLoadingId(notificationId)
                try {
                  await respondToFollowRequest(request.teacher_id, request.student_id, 'reject')
                  setNotifications((prev) => prev.filter((item) => item.id !== notificationId))
                  toast.success(
                    t('item.toasts.followDeclineSuccess', {
                      defaultValue: 'Follow request declined.',
                    }),
                  )
                } catch (error) {
                  console.error('Failed to decline follow request:', error)
                  toast.error(
                    t('item.toasts.declineError', { defaultValue: 'Could not decline request.' }),
                  )
                } finally {
                  setActionLoadingId(null)
                }
              },
            }
          : undefined

        return {
          id: notificationId,
          type: 'follow',
          action: 'follow',
          title: studentName,
          message: formatTimestamp(request.requested_at),
          timestamp: request.requested_at,
          isRead: false,
          avatar: {
            src: request.student?.avatar_url || undefined,
            fallback: getNameInitials(studentName),
            color: 'bg-gray-100',
          },
          actions: followActions,
        } as Notification
      })

      const combined = [...followerNotifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      setNotifications(combined)
      onTotalCountChange?.(combined.length)
    } catch (error) {
      console.error('Failed loading notifications:', error)
      setNotifications([])
      onTotalCountChange?.(0)
      toast.error(t('panel.loadError', { defaultValue: 'Failed to load notifications.' }))
    } finally {
      setLoading(false)
    }
  }, [getRole, onTotalCountChange, t])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const unreadCount = notifications.length
  const filtered = useMemo(() => filterByTab(notifications, activeTab), [notifications, activeTab])
  const usersCount = notifications.filter((n) => getAction(n) === 'follow').length

  const emptyMessage: Record<TabId, { title: string; description: string }> = {
    all: { title: t('panel.emptyAll.title'), description: t('panel.emptyAll.description') },
    users: { title: t('panel.emptyUsers.title'), description: t('panel.emptyUsers.description') },
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
    ],
    [t, unreadCount, usersCount],
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
          <Text
            as="h1"
            variant="h1"
            className="text-xl text-gray-900"
          >
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Text
                  as="p"
                  variant="body"
                  className="text-gray-500 text-base"
                >
                  {t('panel.loading', { defaultValue: 'Loading notifications...' })}
                </Text>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Text
                  as="p"
                  variant="body"
                  className="text-gray-500 text-base"
                >
                  {emptyMessage[activeTab].title}
                </Text>
                <Text
                  as="p"
                  variant="body"
                  className="text-gray-400 text-sm mt-1"
                >
                  {emptyMessage[activeTab].description}
                </Text>
              </div>
            ) : (
              filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isActionLoading={actionLoadingId === notification.id}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
