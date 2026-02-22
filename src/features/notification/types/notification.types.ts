export type NotificationType =
  | 'follow'
  | 'join'
  | 'mention'
  | 'request'
  | 'upload'
  | 'edit'
  | 'general'

/** Drives UI: "wants to follow you" vs "wants to join course" and icon. */
export type NotificationAction = 'follow' | 'join_course'

export interface Notification {
  id: string
  type: NotificationType
  /** Action for this notification (follow vs join course). When set, item shows action line + icon. */
  action?: NotificationAction
  /** Sender/card title; shown as name line (bold). */
  title: string
  /** Secondary line (e.g. "12h ago • Hobby List"); can be truncated. */
  message: string
  timestamp: string
  isRead: boolean
  /** Course name when action is join_course. */
  courseName?: string
  avatar?: {
    src?: string
    fallback: string
    color?: string
  }
  /** @deprecated File attachment block removed from UI; metadata kept for backward compatibility. */
  metadata?: {
    category?: string
    fileName?: string
    fileSize?: string
    fileIcon?: string
  }
  actions?: {
    accept?: () => void
    decline?: () => void
  }
}

export interface NotificationStats {
  all: number
  following: number
  archive: number
}
