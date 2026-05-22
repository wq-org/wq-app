import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import {
  CARD_INSTANT_PREVIEW_EXPANDED_MEDIA_MAX_HEIGHT,
  CARD_INSTANT_PREVIEW_EXPANDED_MEDIA_MAX_HEIGHT_FULLSCREEN,
} from './card-instant-preview.constants'

export type CardInstantPreviewExpandedMediaFrameLayout = 'natural' | 'constrained'

type CardInstantPreviewExpandedMediaFrameProps = {
  children: ReactNode
  isFullscreen: boolean
  /** PDF uses constrained layout so the viewer scrolls inside the dialog. */
  layout?: CardInstantPreviewExpandedMediaFrameLayout
  className?: string
}

export function CardInstantPreviewExpandedMediaFrame({
  children,
  isFullscreen,
  layout = 'natural',
  className,
}: CardInstantPreviewExpandedMediaFrameProps) {
  const isConstrained = layout === 'constrained'
  const maxHeight = isFullscreen
    ? CARD_INSTANT_PREVIEW_EXPANDED_MEDIA_MAX_HEIGHT_FULLSCREEN
    : CARD_INSTANT_PREVIEW_EXPANDED_MEDIA_MAX_HEIGHT

  return (
    <div
      className={cn(
        'flex w-full bg-muted px-4 py-4',
        isConstrained
          ? 'min-h-0 flex-1 flex-col overflow-hidden'
          : 'shrink-0 items-center justify-center',
        !isConstrained && isFullscreen && 'min-h-0 flex-1',
        className,
      )}
      style={
        isConstrained
          ? undefined
          : ({
              '--card-instant-preview-media-max-h': maxHeight,
            } as React.CSSProperties)
      }
    >
      <div
        className={cn(
          isConstrained
            ? 'flex h-full min-h-0 w-full flex-col overflow-hidden'
            : 'flex max-w-full items-center justify-center',
        )}
      >
        {children}
      </div>
    </div>
  )
}
