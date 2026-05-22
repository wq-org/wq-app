import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { BasicPdfViewer } from '@/components/shared/pdf-viewer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CardInstantPreviewEditableTitle } from './CardInstantPreviewEditableTitle'
import { CardInstantPreviewExpandedBody, CardInstantPreviewImage } from './CardInstantPreviewShared'
import type { CardInstantPreviewCardProps } from './card-instant-preview.types'
import {
  cardInstantPreviewTitleId,
  isCardInstantPreviewPdfCard,
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
  const isPdf = isCardInstantPreviewPdfCard(props)

  useEffect(() => {
    setEditedTitle(title)
  }, [id, title])

  const handleTitleChange = useCallback(
    (nextTitle: string) => {
      setEditedTitle(nextTitle)
      onTitleChange?.(nextTitle)
    },
    [onTitleChange],
  )

  useEffect(() => {
    if (!isClosing) {
      dialogRef.current?.focus()
    }
  }, [id, isClosing])

  return (
    <div
      ref={dialogRef}
      data-expanded-root={id}
      data-expanded-media={isPdf ? 'pdf' : 'image'}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cn(
        'pointer-events-auto fixed left-1/2 top-1/2 z-[201]',
        'flex w-[min(720px,calc(100vw-48px))] max-h-[min(90vh,820px)] -translate-x-1/2 -translate-y-1/2',
        'relative flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl duration-300',
        isClosing
          ? 'animate-out fade-out-0 slide-out-to-bottom-4'
          : 'animate-in fade-in-0 slide-in-from-bottom-4',
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-10 rounded-full"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="size-4" />
      </Button>
      <div className="flex min-w-0 flex-col gap-1 rounded-t-[28px] bg-white px-6 pb-4 pt-5 pr-14 text-neutral-900">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          {subtitle}
        </span>
        <CardInstantPreviewEditableTitle
          cardId={id}
          value={editedTitle}
          onChange={handleTitleChange}
          className="text-[28px]"
        />
      </div>

      {isPdf ? (
        <BasicPdfViewer
          source={props.pdfSrc}
          className="h-[min(42vh,360px)] shrink-0 rounded-none border-0 bg-transparent"
        />
      ) : (
        <CardInstantPreviewImage
          imageSrc={props.imageSrc}
          imageAlt={editedTitle}
          imagePosition={imagePosition}
          mode="expanded"
        />
      )}

      <CardInstantPreviewExpandedBody
        description={description}
        content={content}
      />
    </div>
  )
}
