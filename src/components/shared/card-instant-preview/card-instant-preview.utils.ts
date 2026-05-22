import { cn } from '@/lib/utils'
import type {
  CardInstantPreviewCardProps,
  CardInstantPreviewPdfCardProps,
  CardInstantPreviewVideoCardProps,
} from './card-instant-preview.types'

export function cardInstantPreviewTitleId(id: string) {
  return `card-instant-preview-title-${id}`
}

export function isCardInstantPreviewPdfCard(
  card: CardInstantPreviewCardProps,
): card is CardInstantPreviewPdfCardProps {
  return card.media === 'pdf'
}

export function isCardInstantPreviewVideoCard(
  card: CardInstantPreviewCardProps,
): card is CardInstantPreviewVideoCardProps {
  return card.media === 'video'
}

/**
 * Exactly two lines, then ellipsis (…) at the end of line 2.
 * Uses -webkit-line-clamp; avoid break-all so the ellipsis renders correctly.
 */
export const cardInstantPreviewTitleClampClassName = cn(
  'min-w-0 max-w-full overflow-hidden',
  'line-clamp-2 [overflow-wrap:anywhere]',
)
