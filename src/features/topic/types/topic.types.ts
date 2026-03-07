import type { ThemeId } from '@/lib/themes'

export interface Topic {
  id: string
  course_id: string
  title: string
  description: string
  order_index?: number | null
  created_at?: string
  updated_at?: string
}

export interface CreateTopicData {
  title: string
  description: string
}

export interface TopicCardProps {
  id: string
  title: string
  description: string
  themeId?: ThemeId
  onView?: (id: string) => void
  onDelete?: (id: string) => void
  ctaLabel?: string
  deleteLabel?: string
  holdDeleteTooltip?: HoldDeleteTooltipProps
}

export interface HoldDeleteTooltipProps {
  tooltipDelayDuration?: number
  tooltipTitle?: string
  tooltipDescription?: string
  tooltipHoldMessage?: string | ((seconds: number) => string)
  tooltipDeletingIn?: (seconds: number) => string
  tooltipDeleting?: string
  holdDuration?: number
}
