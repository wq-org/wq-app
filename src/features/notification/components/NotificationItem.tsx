import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { Notification, NotificationAction } from '../types/notification.types'
import { cn } from '@/lib/utils'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { UserPlus, GraduationCap } from 'lucide-react'

interface NotificationItemProps {
  notification: Notification
  isActionLoading?: boolean
}

function getAction(notification: Notification): NotificationAction | undefined {
  if (notification.action) return notification.action
  if (notification.type === 'follow') return 'follow'
  if (notification.type === 'join') return 'join_course'
  return undefined
}

export function NotificationItem({ notification, isActionLoading = false }: NotificationItemProps) {
  const { t } = useTranslation('features.notification')
  const action = getAction(notification)

  return (
    <div
      className={cn(
        'flex gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 animate-in fade-in-0 slide-in-from-bottom-2',
        !notification.isRead && 'bg-blue-50/30',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className={cn('h-12 w-12', notification.avatar?.color)}>
          {notification.avatar?.src && (
            <AvatarImage
              src={notification.avatar.src}
              alt={notification.avatar.fallback}
            />
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
        {/* Name */}
        <Text
          as="p"
          variant="body"
          className="text-base font-medium text-gray-900 mb-1 truncate"
        >
          {notification.title}
        </Text>

        {/* Action line with icon */}
        {action && (
          <div className="flex items-center gap-2 mb-1 min-w-0">
            {action === 'follow' ? (
              <UserPlus className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <GraduationCap className="size-4 shrink-0 text-muted-foreground" />
            )}
            <Text
              as="p"
              variant="body"
              className="text-sm text-gray-600 truncate"
            >
              {action === 'follow'
                ? t('item.actionWantsToFollow', { defaultValue: 'wants to follow you' })
                : t('item.actionWantsToJoinCourse', { defaultValue: 'wants to join course' })}
            </Text>
          </div>
        )}

        {/* Course name */}
        {action === 'join_course' && notification.courseName && (
          <Text
            as="p"
            variant="body"
            className="text-sm text-gray-500 mb-1 truncate"
          >
            {t('item.courseLabel', { defaultValue: 'Course' })}: {notification.courseName}
          </Text>
        )}

        {/* Metadata line (e.g. "12h ago • Hobby List") */}
        <Text
          as="p"
          variant="body"
          className="text-sm text-gray-500 mb-2 truncate"
        >
          {notification.message}
        </Text>

        {/* Action buttons */}
        {notification.actions && (
          <div className="flex gap-2 mt-3">
            {notification.actions.accept && (
              <Button
                size="sm"
                variant="default"
                disabled={isActionLoading}
                onClick={(e) => {
                  e.stopPropagation()
                  notification.actions?.accept?.()
                }}
                className="rounded-md active:animate-in active:zoom-in-95 gap-2"
              >
                {isActionLoading ? (
                  <Spinner
                    size="xs"
                    variant="white"
                    className="shrink-0"
                  />
                ) : null}
                {t('item.actions.accept')}
              </Button>
            )}
            {notification.actions.decline && (
              <Button
                size="sm"
                variant="outline"
                disabled={isActionLoading}
                onClick={(e) => {
                  e.stopPropagation()
                  notification.actions?.decline?.()
                }}
                className="rounded-md active:animate-in active:zoom-in-95"
              >
                {t('item.actions.decline')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
