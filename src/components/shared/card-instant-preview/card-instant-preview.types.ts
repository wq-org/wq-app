import type { ReactNode } from 'react'

export type CardInstantPreviewImagePosition = string

export type CardInstantPreviewLayout = 'wide' | 'narrow'

/** Grid list item presentation — expanded view is unchanged. */
export type CardInstantPreviewListItemVariant = 'default' | 'compact'

/** Universal card fields — grid teaser and expanded detail share these. */
export type CardInstantPreviewCardProps = {
  id: string
  subtitle: string
  title: string
  imageSrc: string
  description: string
  /** Extra expanded content below the description (forms, lists, CTAs, etc.). */
  content?: ReactNode
  /** CSS background-position, e.g. `center top` or `center 20%` */
  imagePosition?: CardInstantPreviewImagePosition
  layout?: CardInstantPreviewLayout
  /** Grid teaser layout; `compact` fills the card with image + overlaid text. */
  variant?: CardInstantPreviewListItemVariant
}

export type CardInstantPreviewListItemProps = CardInstantPreviewCardProps & {
  isExpanded: boolean
  onSelect: (id: string, trigger: HTMLButtonElement) => void
  className?: string
}

export type CardInstantPreviewProps = {
  heading?: string
  avatarSrc?: string
  avatarAlt?: string
  items: CardInstantPreviewCardProps[]
  className?: string
  onOpen?: (id: string) => void
  onClose?: () => void
}

export const CARD_INSTANT_PREVIEW_ANIMATION_DURATION_MS = 300

export const CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID = 200
export const CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID = 350
export const CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID = 300
