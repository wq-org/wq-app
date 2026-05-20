import type { ReactNode } from 'react'

export type ScrollDrivenIndexItem = {
  id: string
  label: string
  href?: string
}

export type ScrollDrivenIndexAlignment = 'left' | 'center' | 'right'

export type ScrollDrivenIndexTone = 'default' | 'muted'

export type ScrollDrivenIndexProps = {
  items: ScrollDrivenIndexItem[]
  label?: string
  alignment?: ScrollDrivenIndexAlignment
  tone?: ScrollDrivenIndexTone
  popoverId?: string
  className?: string
  children?: ReactNode
  /** CSS selector of the scroll container. Defaults to documentElement. */
  scrollContainerSelector?: string
  /** Hide the scroll-depth progress badge in the trigger and popover. */
  hideScrollDrivenIndexProgress?: boolean
}

export type ScrollDrivenIndexTriggerProps = {
  label: string
  popoverId: string
  tone?: ScrollDrivenIndexTone
  className?: string
  progress?: number
  hideScrollDrivenIndexProgress?: boolean
}

export type ScrollDrivenIndexPanelProps = {
  popoverId: string
  label: string
  items: ScrollDrivenIndexItem[]
  className?: string
  hideScrollDrivenIndexProgress?: boolean
}

export type ScrollDrivenIndexListProps = {
  items: ScrollDrivenIndexItem[]
  popoverId: string
  className?: string
}

export type ScrollDrivenIndexLinkProps = {
  item: ScrollDrivenIndexItem
  popoverId: string
  className?: string
}
