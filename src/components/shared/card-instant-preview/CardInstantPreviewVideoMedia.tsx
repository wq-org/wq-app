import { Video } from 'lucide-react'

import { IconPreviewCardSquare } from '../IconPreviewCard'
import { cn } from '@/lib/utils'
import { getColorCss } from '@/lib/themes'
import { CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID } from './card-instant-preview.constants'
import { CardInstantPreviewExpandedVideo } from './CardInstantPreviewExpandedMedia'

const VIDEO_TEASER_BACKGROUND = getColorCss('orange')
const GRID_IMAGE_HEIGHT = CARD_INSTANT_PREVIEW_IMAGE_HEIGHT_GRID

export type CardInstantPreviewVideoGridTeaserProps = {
  videoSrc: string
  videoAlt: string
  mode: 'grid' | 'compact'
  gridImageHeight?: number
  className?: string
}

export function CardInstantPreviewVideoGridTeaser({
  videoSrc,
  videoAlt,
  mode,
  gridImageHeight = GRID_IMAGE_HEIGHT,
  className,
}: CardInstantPreviewVideoGridTeaserProps) {
  if (mode === 'compact') {
    return (
      <div className={cn('absolute inset-0', className)}>
        <IconPreviewCardSquare
          icon={Video}
          backgroundColor={VIDEO_TEASER_BACKGROUND}
          blurred={false}
          className="size-full rounded-none"
        />
      </div>
    )
  }

  return (
    <div
      className={cn('relative w-full shrink-0 overflow-hidden bg-muted', className)}
      style={{ height: gridImageHeight }}
    >
      <video
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        aria-label={videoAlt}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  )
}

export type CardInstantPreviewVideoExpandedProps = {
  videoSrc: string
  fileName: string
  isFullscreen?: boolean
}

/** @deprecated Prefer `CardInstantPreviewExpandedVideo` from `./CardInstantPreviewExpandedMedia`. */
export function CardInstantPreviewVideoExpanded({
  videoSrc,
  fileName,
  isFullscreen = false,
}: CardInstantPreviewVideoExpandedProps) {
  return (
    <CardInstantPreviewExpandedVideo
      videoSrc={videoSrc}
      fileName={fileName}
      isFullscreen={isFullscreen}
    />
  )
}
