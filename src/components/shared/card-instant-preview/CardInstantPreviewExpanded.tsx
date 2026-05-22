import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CardInstantPreviewEditableTitle } from './CardInstantPreviewEditableTitle'
import { CardInstantPreviewExpandedMedia } from './CardInstantPreviewExpandedMedia'
import { CardInstantPreviewExpandedBody } from './CardInstantPreviewShared'
import type { CardInstantPreviewCardProps } from './card-instant-preview.types'
import {
  CARD_INSTANT_PREVIEW_EXPANDED_FOOTER_MAX_HEIGHT,
  CARD_INSTANT_PREVIEW_EXPANDED_FOOTER_MAX_HEIGHT_FULLSCREEN,
} from './card-instant-preview.constants'
import {
  cardInstantPreviewTitleId,
  getCardInstantPreviewMediaVariant,
} from './card-instant-preview.utils'

type CardInstantPreviewExpandedProps = CardInstantPreviewCardProps & {
  isClosing: boolean
  onClose: () => void
  onTitleChange?: (title: string) => void
}

export function CardInstantPreviewExpanded(props: CardInstantPreviewExpandedProps) {
  const {
    id,
    subtitle,
    title,
    description,
    content,
    imagePosition,
    isClosing,
    onClose,
    onTitleChange,
  } = props

  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = cardInstantPreviewTitleId(id)
  const [editedTitle, setEditedTitle] = useState(title)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const mediaVariant = getCardInstantPreviewMediaVariant(props)
  const footerMaxHeight = isFullscreen
    ? CARD_INSTANT_PREVIEW_EXPANDED_FOOTER_MAX_HEIGHT_FULLSCREEN
    : CARD_INSTANT_PREVIEW_EXPANDED_FOOTER_MAX_HEIGHT

  useEffect(() => {
    setEditedTitle(title)
  }, [id, title])

  useEffect(() => {
    if (isClosing) {
      setIsFullscreen(false)
    }
  }, [isClosing])

  const handleTitleChange = useCallback(
    (nextTitle: string) => {
      setEditedTitle(nextTitle)
      onTitleChange?.(nextTitle)
    },
    [onTitleChange],
  )

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((current) => !current)
  }, [])

  useEffect(() => {
    if (!isClosing) {
      dialogRef.current?.focus()
    }
  }, [id, isClosing])

  const FullscreenToggleIcon = isFullscreen ? ArrowDownLeft : ArrowUpRight
  const fullscreenToggleLabel = isFullscreen ? 'Exit full screen' : 'Expand to full screen'

  return (
    <div
      ref={dialogRef}
      data-expanded-root={id}
      data-expanded-media={mediaVariant}
      data-expanded-fullscreen={isFullscreen ? 'true' : 'false'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn(
        'pointer-events-auto fixed z-[201] flex min-h-0 flex-col overflow-hidden',
        'bg-card text-card-foreground shadow-2xl duration-300',
        isFullscreen
          ? 'inset-0 h-screen w-screen max-h-none max-w-none rounded-none'
          : [
              'inset-x-4 bottom-4 top-auto mx-auto w-full max-w-[min(720px,calc(100vw-2rem))]',
              'max-h-[min(calc(100dvh-2rem),820px)] rounded-[28px]',
              'sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[min(90vh,820px)]',
              'sm:w-[min(720px,calc(100vw-48px))] sm:-translate-x-1/2 sm:-translate-y-1/2',
            ],
        isClosing
          ? 'animate-out fade-out-0 slide-out-to-bottom-4'
          : 'animate-in fade-in-0 slide-in-from-bottom-4',
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          if (isFullscreen) {
            setIsFullscreen(false)
            return
          }
          onClose()
          return
        }
        e.stopPropagation()
      }}
    >
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={handleToggleFullscreen}
          aria-label={fullscreenToggleLabel}
          aria-pressed={isFullscreen}
        >
          <FullscreenToggleIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div
        className={cn(
          'flex min-w-0 shrink-0 flex-col gap-1 rounded-t-[28px] bg-card px-6 pb-4 pt-5 pr-24 text-card-foreground',
          isFullscreen && 'rounded-none',
        )}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {subtitle}
        </span>
        <CardInstantPreviewEditableTitle
          cardId={id}
          value={editedTitle}
          onChange={handleTitleChange}
          className="text-[28px]"
        />
      </div>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        style={
          {
            '--card-instant-preview-footer-max-h': footerMaxHeight,
          } as React.CSSProperties
        }
      >
        <CardInstantPreviewExpandedMedia
          card={props}
          editedTitle={editedTitle}
          imagePosition={imagePosition}
          isFullscreen={isFullscreen}
        />

        <CardInstantPreviewExpandedBody
          description={description}
          content={content}
          className={cn(
            'shrink-0 min-h-0 max-h-[var(--card-instant-preview-footer-max-h)] overflow-y-auto',
          )}
        />
      </div>
    </div>
  )
}
