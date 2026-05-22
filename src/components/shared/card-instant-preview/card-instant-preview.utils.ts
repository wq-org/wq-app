import { lineClampClassName } from '@/lib/text-clamp'
import { CARD_INSTANT_PREVIEW_MEDIA } from './card-instant-preview.constants'
import type {
  CardInstantPreviewCardProps,
  CardInstantPreviewImageCardProps,
  CardInstantPreviewPdfCardProps,
  CardInstantPreviewVideoCardProps,
} from './card-instant-preview.types'
import type { CardInstantPreviewMediaVariant } from './card-instant-preview.constants'

export function cardInstantPreviewTitleId(id: string) {
  return `card-instant-preview-title-${id}`
}

export function getCardInstantPreviewMediaVariant(
  card: CardInstantPreviewCardProps,
): CardInstantPreviewMediaVariant {
  if (card.media === CARD_INSTANT_PREVIEW_MEDIA.pdf) {
    return CARD_INSTANT_PREVIEW_MEDIA.pdf
  }
  if (card.media === CARD_INSTANT_PREVIEW_MEDIA.video) {
    return CARD_INSTANT_PREVIEW_MEDIA.video
  }
  return CARD_INSTANT_PREVIEW_MEDIA.image
}

export function isCardInstantPreviewImageCard(
  card: CardInstantPreviewCardProps,
): card is CardInstantPreviewImageCardProps {
  return getCardInstantPreviewMediaVariant(card) === CARD_INSTANT_PREVIEW_MEDIA.image
}

export function isCardInstantPreviewPdfCard(
  card: CardInstantPreviewCardProps,
): card is CardInstantPreviewPdfCardProps {
  return card.media === CARD_INSTANT_PREVIEW_MEDIA.pdf
}

export function isCardInstantPreviewVideoCard(
  card: CardInstantPreviewCardProps,
): card is CardInstantPreviewVideoCardProps {
  return card.media === CARD_INSTANT_PREVIEW_MEDIA.video
}

export function isCardInstantPreviewConstrainedExpandedMedia(
  variant: CardInstantPreviewMediaVariant,
): boolean {
  return variant === CARD_INSTANT_PREVIEW_MEDIA.pdf || variant === CARD_INSTANT_PREVIEW_MEDIA.video
}

/** Two-line clamp for grid/list card titles (see `lineClampClassName`). */
export const cardInstantPreviewTitleClampClassName = lineClampClassName(2)
