import type {
  CardInstantPreviewCardProps,
  CardInstantPreviewPdfCardProps,
} from './card-instant-preview.types'

export function cardInstantPreviewTitleId(id: string) {
  return `card-instant-preview-title-${id}`
}

export function isCardInstantPreviewPdfCard(
  card: CardInstantPreviewCardProps,
): card is CardInstantPreviewPdfCardProps {
  return card.media === 'pdf'
}
