import type { ReactNode } from 'react'
import { FileText } from 'lucide-react'
import { IconPreviewCardSquare, IconPreviewCardWide } from '../IconPreviewCard'
import { cn } from '@/lib/utils'
import { getColorCss } from '@/lib/themes'
import type { CardInstantPreviewImagePosition } from './card-instant-preview.types'
import { CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID } from './card-instant-preview.types'
import { cardInstantPreviewTitleId } from './card-instant-preview.utils'

const PDF_TEASER_BACKGROUND = getColorCss('blue')

type CardInstantPreviewImageProps = {
  imageSrc: string
  imageAlt: string
  imagePosition?: CardInstantPreviewImagePosition
  mode: 'grid' | 'expanded'
  className?: string
}

export function CardInstantPreviewImage({
  imageSrc,
  imageAlt,
  imagePosition,
  mode,
  className,
}: CardInstantPreviewImageProps) {
  return (
    <div
      className={cn(
        'w-full shrink-0 overflow-hidden bg-neutral-200',
        mode === 'grid' ? 'h-[200px]' : 'h-[min(42vh,360px)]',
        className,
      )}
      style={{
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: imagePosition ?? 'center center',
        backgroundRepeat: 'no-repeat',
      }}
      role="img"
      aria-label={imageAlt}
    />
  )
}

type CardInstantPreviewHeaderProps = {
  cardId: string
  subtitle: string
  title: string
  mode: 'grid' | 'expanded'
  className?: string
}

export function CardInstantPreviewHeader({
  cardId,
  subtitle,
  title,
  mode,
  className,
}: CardInstantPreviewHeaderProps) {
  const titleId = cardInstantPreviewTitleId(cardId)

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1 bg-white text-neutral-900',
        mode === 'grid' ? 'px-5 py-4' : 'rounded-t-[28px] px-6 pb-4 pt-5',
        className,
      )}
    >
      <span
        id={titleId}
        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500"
      >
        {subtitle}
      </span>
      <h2
        className={cn(
          'font-bold leading-[1.12] tracking-tight text-neutral-900',
          mode === 'grid' ? 'text-[22px]' : 'text-[28px]',
          'break-words',
        )}
      >
        {title}
      </h2>
    </div>
  )
}

type CardInstantPreviewPdfGridTeaserProps = {
  mode: 'grid' | 'compact'
  className?: string
}

export function CardInstantPreviewPdfGridTeaser({
  mode,
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
      style={{ height: CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID }}
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
}

export function CardInstantPreviewExpandedBody({
  description,
  content,
}: CardInstantPreviewExpandedBodyProps) {
  return (
    <div className="flex flex-col gap-4 rounded-b-[28px] bg-white px-6 py-6">
      <p className="text-[15px] leading-relaxed text-neutral-600">{description}</p>
      {content ? (
        <div className="text-[15px] leading-relaxed text-neutral-600">{content}</div>
      ) : null}
    </div>
  )
}
