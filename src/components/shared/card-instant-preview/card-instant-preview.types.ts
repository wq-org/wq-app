import type { ReactNode } from 'react'

export type CardInstantPreviewImagePosition = string

export type CardInstantPreviewLayout = 'wide' | 'narrow'

/** Grid list item layout */
export type CardInstantPreviewListItemVariant = 'default' | 'compact'

/** Expanded + grid media */
export type CardInstantPreviewMediaType = 'image' | 'pdf'

type CardInstantPreviewCardBase = {
  id: string
  subtitle: string
  title: string
  description: string
  /** Extra expanded content below the description (forms, lists, CTAs, etc.). */
  content?: ReactNode
  /** CSS background-position for image cards, e.g. `center top` */
  imagePosition?: CardInstantPreviewImagePosition
  layout?: CardInstantPreviewLayout
  /** Grid teaser layout */
  variant?: CardInstantPreviewListItemVariant
}

/** Image card — `media` omitted or `'image'` */
export type CardInstantPreviewImageCardProps = CardInstantPreviewCardBase & {
  media?: 'image'
  imageSrc: string
}

/** PDF card — real PDF only in expanded view; grid shows icon teaser */
export type CardInstantPreviewPdfCardProps = CardInstantPreviewCardBase & {
  media: 'pdf'
  pdfSrc: string
}

/** Universal card fields — grid teaser and expanded detail share these */
export type CardInstantPreviewCardProps =
  | CardInstantPreviewImageCardProps
  | CardInstantPreviewPdfCardProps

export type CardInstantPreviewListItemProps = CardInstantPreviewCardProps & {
  isExpanded: boolean
  onSelect: (id: string, trigger: HTMLButtonElement) => void
  className?: string
}

export type CardInstantPreviewProps = {
  heading?: string
  items: CardInstantPreviewCardProps[]
  className?: string
  onOpen?: (id: string) => void
  onClose?: () => void
  /** Persist renamed title when user commits inline edit in the expanded card. */
  onItemTitleChange?: (id: string, title: string) => void
}

export const CARD_INSTANT_PREVIEW_ANIMATION_DURATION_MS = 300

export const CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID = 200
export const CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID = 350
export const CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID = 300
