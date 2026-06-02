import { useEffect, useRef, useState, type ReactNode } from 'react'
import { FileText } from 'lucide-react'
import { IconPreviewCardSquare, IconPreviewCardWide } from '../IconPreviewCard'
import { cn } from '@/lib/utils'
import { getColorCss } from '@/lib/themes'
import type { CardInstantPreviewImagePosition } from './card-instant-preview.types'
import { CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID } from './card-instant-preview.constants'
import {
  cardInstantPreviewTitleId,
  cardInstantPreviewTitleClampClassName,
} from './card-instant-preview.utils'

const PDF_TEASER_BACKGROUND = getColorCss('blue')

const GRID_IMAGE_HEIGHT = CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID

type CardInstantPreviewImageProps = {
  imageSrc: string
  imageAlt: string
  imagePosition?: CardInstantPreviewImagePosition
  gridImageHeight?: number
  className?: string
}

export function CardInstantPreviewImage({
  imageSrc,
  imageAlt,
  imagePosition,
  gridImageHeight = GRID_IMAGE_HEIGHT,
  className,
}: CardInstantPreviewImageProps) {
  const height = gridImageHeight
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Reset fade-in state whenever the source changes (e.g. signed-URL refresh).
  useEffect(() => {
    setIsLoaded(false)
  }, [imageSrc])

  // Cached images may already be `complete` before React attaches the `load` handler.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setIsLoaded(true)
    }
  }, [imageSrc])

  return (
    <div
      className={cn('relative w-full shrink-0 overflow-hidden bg-muted', className)}
      style={{ height }}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 bg-muted transition-opacity duration-300 ease-out',
          isLoaded ? 'opacity-0' : 'animate-pulse opacity-100',
        )}
      />
      <img
        ref={imgRef}
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        draggable={false}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
        style={{ objectPosition: imagePosition ?? 'center center' }}
      />
    </div>
  )
}

type CardInstantPreviewHeaderProps = {
  cardId: string
  subtitle: string
  title: string
  mode: 'grid' | 'expanded'
  titleClassName?: string
  className?: string
}

export function CardInstantPreviewHeader({
  cardId,
  subtitle,
  title,
  mode,
  titleClassName,
  className,
}: CardInstantPreviewHeaderProps) {
  const titleId = cardInstantPreviewTitleId(cardId)

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1 bg-card text-card-foreground',
        mode === 'grid' ? 'shrink-0 px-5 py-4' : 'rounded-t-[28px] px-6 pb-4 pt-5',
        className,
      )}
    >
      <span
        id={titleId}
        className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
      >
        {subtitle}
      </span>
      <h2
        className={cn(
          'font-bold leading-[1.12] tracking-tight text-foreground',
          mode === 'grid' ? titleClassName : 'text-[28px]',
          mode === 'grid' && cardInstantPreviewTitleClampClassName,
        )}
        title={mode === 'grid' ? title : undefined}
      >
        {title}
      </h2>
    </div>
  )
}

type CardInstantPreviewPdfGridTeaserProps = {
  mode: 'grid' | 'compact'
  gridImageHeight?: number
  className?: string
}

export function CardInstantPreviewPdfGridTeaser({
  mode,
  gridImageHeight = GRID_IMAGE_HEIGHT,
  className,
}: CardInstantPreviewPdfGridTeaserProps) {
  if (mode === 'compact') {
    return (
      <div className={cn('absolute inset-0', className)}>
        <IconPreviewCardSquare
          icon={FileText}
          backgroundColor={PDF_TEASER_BACKGROUND}
          blurred={false}
          className="size-full rounded-none"
        />
      </div>
    )
  }

  return (
    <div
      className={cn('w-full shrink-0 overflow-hidden', className)}
      style={{ height: gridImageHeight }}
    >
      <IconPreviewCardWide
        icon={FileText}
        backgroundColor={PDF_TEASER_BACKGROUND}
        blurred
        className="h-full rounded-none"
      />
    </div>
  )
}

type CardInstantPreviewExpandedBodyProps = {
  description: string
  content?: ReactNode
  className?: string
}

export function CardInstantPreviewExpandedBody({
  description,
  content,
  className,
}: CardInstantPreviewExpandedBodyProps) {
  const showDescription = Boolean(description.trim()) && !content

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-b-[28px] bg-card px-6 py-6 text-card-foreground',
        className,
      )}
    >
      {showDescription ? (
        <p className="text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {content ? (
        <div className="min-w-0 text-[15px] leading-relaxed text-muted-foreground">{content}</div>
      ) : null}
    </div>
  )
}
