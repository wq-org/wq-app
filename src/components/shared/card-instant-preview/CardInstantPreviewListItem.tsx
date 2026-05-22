import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import {
  CardInstantPreviewHeader,
  CardInstantPreviewImage,
  CardInstantPreviewPdfGridTeaser,
} from './CardInstantPreviewShared'
import {
  cardInstantPreviewTitleClampClassName,
  cardInstantPreviewTitleId,
} from './card-instant-preview.utils'
import {
  CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID,
  CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID,
  CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID,
} from './card-instant-preview.types'
import type { CardInstantPreviewListItemProps } from './card-instant-preview.types'
import { isCardInstantPreviewPdfCard } from './card-instant-preview.utils'

const cardInstantPreviewListItemButtonClassName = cn(
  'overflow-hidden rounded-[28px] text-left shadow-sm',
  'border border-transparent',
  'transition-[box-shadow,border-color] duration-200 ease-out',
  'hover:border-secondary hover:shadow-md',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

const listItemStyle = {
  width: CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID,
  maxWidth: '100%',
} as const

const gridCardStyle = {
  width: CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID,
  maxWidth: '100%',
  '--card-instant-preview-grid-height': `${CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID}px`,
} as CSSProperties

function CardInstantPreviewListItemCompact({
  id,
  subtitle,
  title,
  imageSrc,
  imagePosition,
  isExpanded,
  onSelect,
  className,
}: CardInstantPreviewListItemProps) {
  const titleId = cardInstantPreviewTitleId(id)

  return (
    <li
      data-card-instant-preview-card
      data-card-id={id}
      data-card-variant="compact"
      data-card-media="image"
      className={cn('list-none max-w-full shrink-0', className)}
      style={listItemStyle}
    >
      <button
        type="button"
        data-card-instant-preview-trigger={id}
        aria-expanded={isExpanded}
        aria-controls={`card-instant-preview-dialog-${id}`}
        aria-labelledby={titleId}
        onClick={(event) => onSelect(id, event.currentTarget)}
        className={cn('relative w-full', cardInstantPreviewListItemButtonClassName)}
        style={{ height: CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID }}
      >
        <div className="relative isolate h-full overflow-hidden rounded-[28px]">
          <img
            src={imageSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: imagePosition ?? 'center center' }}
          />

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          />

          <div
            aria-hidden
            className="absolute inset-x-0 top-[30%] bottom-0 z-[1] bg-black/15 backdrop-blur-xl"
            style={{
              maskImage:
                'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.45) 50%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.45) 50%, transparent 100%)',
            }}
          />

          <div className="absolute inset-x-0 bottom-0 z-10 flex min-w-0 flex-col gap-1 px-5 pb-5 pt-8">
            <span
              id={titleId}
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80"
            >
              {subtitle}
            </span>
            <h2
              className={cn(
                'text-[22px] font-bold leading-[1.12] tracking-tight text-white',
                cardInstantPreviewTitleClampClassName,
              )}
            >
              {title}
            </h2>
          </div>
        </div>
      </button>
    </li>
  )
}

function CardInstantPreviewListItemCompactPdf({
  id,
  subtitle,
  title,
  isExpanded,
  onSelect,
  className,
}: CardInstantPreviewListItemProps) {
  const titleId = cardInstantPreviewTitleId(id)

  return (
    <li
      data-card-instant-preview-card
      data-card-id={id}
      data-card-variant="compact"
      data-card-media="pdf"
      className={cn('list-none max-w-full shrink-0', className)}
      style={listItemStyle}
    >
      <button
        type="button"
        data-card-instant-preview-trigger={id}
        aria-expanded={isExpanded}
        aria-controls={`card-instant-preview-dialog-${id}`}
        aria-labelledby={titleId}
        onClick={(event) => onSelect(id, event.currentTarget)}
        className={cn('relative w-full', cardInstantPreviewListItemButtonClassName)}
        style={{ height: CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID }}
      >
        <div className="relative isolate h-full overflow-hidden rounded-[28px]">
          <CardInstantPreviewPdfGridTeaser mode="compact" />

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          />

          <div
            aria-hidden
            className="absolute inset-x-0 top-[30%] bottom-0 z-[1] bg-black/15 backdrop-blur-xl"
            style={{
              maskImage:
                'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.45) 50%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.45) 50%, transparent 100%)',
            }}
          />

          <div className="absolute inset-x-0 bottom-0 z-10 flex min-w-0 flex-col gap-1 px-5 pb-5 pt-8">
            <span
              id={titleId}
              className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80"
            >
              {subtitle}
            </span>
            <h2
              className={cn(
                'text-[22px] font-bold leading-[1.12] tracking-tight text-white',
                cardInstantPreviewTitleClampClassName,
              )}
            >
              {title}
            </h2>
          </div>
        </div>
      </button>
    </li>
  )
}

function CardInstantPreviewListItemDefault({
  id,
  subtitle,
  title,
  imageSrc,
  imagePosition,
  isExpanded,
  onSelect,
  className,
}: CardInstantPreviewListItemProps) {
  const titleId = cardInstantPreviewTitleId(id)

  return (
    <li
      data-card-instant-preview-card
      data-card-id={id}
      data-card-variant="default"
      data-card-media="image"
      className={cn('list-none max-w-full shrink-0', className)}
      style={listItemStyle}
    >
      <button
        type="button"
        data-card-instant-preview-trigger={id}
        aria-expanded={isExpanded}
        aria-controls={`card-instant-preview-dialog-${id}`}
        aria-labelledby={titleId}
        onClick={(event) => onSelect(id, event.currentTarget)}
        className={cn(
          'flex h-[var(--card-instant-preview-grid-height)] w-full min-w-0 flex-col overflow-hidden bg-card text-card-foreground',
          cardInstantPreviewListItemButtonClassName,
        )}
        style={gridCardStyle}
      >
        <CardInstantPreviewImage
          imageSrc={imageSrc}
          imageAlt={title}
          imagePosition={imagePosition}
          mode="grid"
          gridImageHeight={CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID}
        />
        <CardInstantPreviewHeader
          cardId={id}
          subtitle={subtitle}
          title={title}
          mode="grid"
          titleClassName="text-[22px]"
        />
      </button>
    </li>
  )
}

function CardInstantPreviewListItemDefaultPdf({
  id,
  subtitle,
  title,
  isExpanded,
  onSelect,
  className,
}: CardInstantPreviewListItemProps) {
  const titleId = cardInstantPreviewTitleId(id)

  return (
    <li
      data-card-instant-preview-card
      data-card-id={id}
      data-card-variant="default"
      data-card-media="pdf"
      className={cn('list-none max-w-full shrink-0', className)}
      style={listItemStyle}
    >
      <button
        type="button"
        data-card-instant-preview-trigger={id}
        aria-expanded={isExpanded}
        aria-controls={`card-instant-preview-dialog-${id}`}
        aria-labelledby={titleId}
        onClick={(event) => onSelect(id, event.currentTarget)}
        className={cn(
          'flex h-[var(--card-instant-preview-grid-height)] w-full min-w-0 flex-col overflow-hidden bg-card text-card-foreground',
          cardInstantPreviewListItemButtonClassName,
        )}
        style={gridCardStyle}
      >
        <CardInstantPreviewPdfGridTeaser
          mode="grid"
          gridImageHeight={CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID}
        />
        <CardInstantPreviewHeader
          cardId={id}
          subtitle={subtitle}
          title={title}
          mode="grid"
          titleClassName="text-[22px]"
        />
      </button>
    </li>
  )
}

export function CardInstantPreviewListItem(props: CardInstantPreviewListItemProps) {
  if (isCardInstantPreviewPdfCard(props)) {
    if (props.variant === 'compact') {
      return <CardInstantPreviewListItemCompactPdf {...props} />
    }
    return <CardInstantPreviewListItemDefaultPdf {...props} />
  }

  if (props.variant === 'compact') {
    return <CardInstantPreviewListItemCompact {...props} />
  }

  return <CardInstantPreviewListItemDefault {...props} />
}
