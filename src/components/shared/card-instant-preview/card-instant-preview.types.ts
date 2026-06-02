import type { ReactNode } from 'react'

import {
  CARD_INSTANT_PREVIEW_MEDIA,
  type CardInstantPreviewMediaVariant,
} from './card-instant-preview.constants'

export type { CardInstantPreviewMediaVariant } from './card-instant-preview.constants'

/** @deprecated Use `CardInstantPreviewMediaVariant`. */
export type CardInstantPreviewMediaType = CardInstantPreviewMediaVariant

export type CardInstantPreviewImagePosition = string

export type CardInstantPreviewLayout = 'wide' | 'narrow'

/** Grid list item layout */
export type CardInstantPreviewListItemVariant = 'default' | 'compact'

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

/** Image card — `media` omitted defaults to image */
export type CardInstantPreviewImageCardProps = CardInstantPreviewCardBase & {
  media?: typeof CARD_INSTANT_PREVIEW_MEDIA.image
  imageSrc: string
}

/** PDF card — grid icon teaser; expanded shows PDF viewer */
export type CardInstantPreviewPdfCardProps = CardInstantPreviewCardBase & {
  media: typeof CARD_INSTANT_PREVIEW_MEDIA.pdf
  pdfSrc: string
}

/** Video card — grid poster frame; expanded shows native video controls */
export type CardInstantPreviewVideoCardProps = CardInstantPreviewCardBase & {
  media: typeof CARD_INSTANT_PREVIEW_MEDIA.video
  videoSrc: string
}

/** Universal card fields — grid teaser and expanded detail share these */
export type CardInstantPreviewCardProps =
  | CardInstantPreviewImageCardProps
  | CardInstantPreviewPdfCardProps
  | CardInstantPreviewVideoCardProps

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
