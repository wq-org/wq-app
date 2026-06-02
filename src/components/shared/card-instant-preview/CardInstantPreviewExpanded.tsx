import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CardInstantPreviewEditableTitle } from './CardInstantPreviewEditableTitle'
import { CardInstantPreviewExpandedMedia } from './CardInstantPreviewExpandedMedia'
import { CardInstantPreviewExpandedBody } from './CardInstantPreviewShared'
import {
  cardInstantPreviewExpandedShellBaseClassName,
  cardInstantPreviewExpandedShellFullscreenClassName,
  cardInstantPreviewExpandedShellModalClassName,
} from './card-instant-preview.constants'
import type { CardInstantPreviewCardProps } from './card-instant-preview.types'
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
        cardInstantPreviewExpandedShellBaseClassName,
        isFullscreen
          ? cardInstantPreviewExpandedShellFullscreenClassName
          : cardInstantPreviewExpandedShellModalClassName,
        isClosing ? 'animate-out fade-out-0' : 'animate-in fade-in-0',
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardInstantPreviewExpandedMedia
          card={props}
          editedTitle={editedTitle}
          imagePosition={imagePosition}
        />

        <CardInstantPreviewExpandedBody
          description={description}
          content={content}
          className="shrink-0"
        />
      </div>
    </div>
  )
}
