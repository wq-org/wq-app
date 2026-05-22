import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'
import { CardInstantPreviewHeader } from './CardInstantPreviewShared'
import { CardInstantPreviewVideoGridTeaser } from './CardInstantPreviewVideoMedia'
import {
  cardInstantPreviewTitleClampClassName,
  cardInstantPreviewTitleId,
} from './card-instant-preview.utils'
import {
  CARD_INSTANT_PREVIEW_CARD_HEIGHT_GRID,
  CARD_INSTANT_PREVIEW_CARD_WIDTH_GRID,
  CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID,
  CARD_INSTANT_PREVIEW_MEDIA,
} from './card-instant-preview.constants'
import type { CardInstantPreviewVideoCardProps } from './card-instant-preview.types'

type CardInstantPreviewListItemVideoProps = CardInstantPreviewVideoCardProps & {
  isExpanded: boolean
  onSelect: (id: string, trigger: HTMLButtonElement) => void
  className?: string
  variant?: 'default' | 'compact'
}

const cardInstantPreviewListItemButtonClassName = cn(
  'overflow-hidden rounded-[28px] text-left shadow-sm',
  'border-2 border-transparent',
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

export function CardInstantPreviewListItemVideo({
  id,
  subtitle,
  title,
  videoSrc,
  isExpanded,
  onSelect,
  className,
  variant = 'default',
}: CardInstantPreviewListItemVideoProps) {
  const titleId = cardInstantPreviewTitleId(id)

  if (variant === 'compact') {
    return (
      <li
        data-card-instant-preview-card
        data-card-id={id}
        data-card-variant="compact"
        data-card-media={CARD_INSTANT_PREVIEW_MEDIA.video}
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
            <CardInstantPreviewVideoGridTeaser
              videoSrc={videoSrc}
              videoAlt={title}
              mode="compact"
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

  return (
    <li
      data-card-instant-preview-card
      data-card-id={id}
      data-card-variant="default"
      data-card-media={CARD_INSTANT_PREVIEW_MEDIA.video}
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
        <CardInstantPreviewVideoGridTeaser
          videoSrc={videoSrc}
          videoAlt={title}
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
