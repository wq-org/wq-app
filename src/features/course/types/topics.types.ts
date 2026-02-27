export type Topic = {
  id: string
  name: string
  description: string
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

export type TopicBadgeProps = {
  topic: Topic
  isSelected: boolean
  index: number
  onToggle: (topic: Topic) => void
  onDelete?: (topic: Topic) => void
  holdDeleteTooltip?: HoldDeleteTooltipProps
}
