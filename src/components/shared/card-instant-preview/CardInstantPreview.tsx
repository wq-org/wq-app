import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { CardInstantPreviewExpanded } from './CardInstantPreviewExpanded'
import { CardInstantPreviewList } from './CardInstantPreviewList'
import type { CardInstantPreviewProps } from './card-instant-preview.types'
import { CARD_INSTANT_PREVIEW_ANIMATION_DURATION_MS } from './card-instant-preview.constants'

export function CardInstantPreview({
  heading,
  items,
  className,
  onOpen,
  onClose,
  onItemTitleChange,
}: CardInstantPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeItem = items.find((item) => item.id === activeId) ?? null
  const isOpen = Boolean(activeId)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const handleSelect = useCallback(
    (id: string, trigger: HTMLButtonElement) => {
      if (activeId || isClosing) return
      clearCloseTimer()
      triggerRef.current = trigger
      setActiveId(id)
      setIsClosing(false)
      onOpen?.(id)
    },
    [activeId, clearCloseTimer, isClosing, onOpen],
  )

  const handleClose = useCallback(() => {
    if (!activeId || isClosing) return
    setIsClosing(true)
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setActiveId(null)
      setIsClosing(false)
      requestAnimationFrame(() => triggerRef.current?.focus())
      onClose?.()
      closeTimerRef.current = null
    }, CARD_INSTANT_PREVIEW_ANIMATION_DURATION_MS)
  }, [activeId, clearCloseTimer, isClosing, onClose])

  const handleItemTitleChange = useCallback(
    (title: string) => {
      if (!activeItem) return
      onItemTitleChange?.(activeItem.id, title)
    },
    [activeItem, onItemTitleChange],
  )

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [handleClose, isOpen])

  useEffect(() => {
    if (!isOpen && !isClosing) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isClosing, isOpen])

  const expandedLayer =
    typeof document !== 'undefined' && activeItem
      ? createPortal(
          <>
            <div
              aria-hidden
              className={cn(
                'fixed inset-0 z-[200] bg-black/40 duration-300',
                isClosing ? 'animate-out fade-out-0' : 'animate-in fade-in-0',
              )}
              onClick={handleClose}
            />
            <CardInstantPreviewExpanded
              {...activeItem}
              isClosing={isClosing}
              onClose={handleClose}
              onTitleChange={onItemTitleChange ? handleItemTitleChange : undefined}
            />
          </>,
          document.body,
        )
      : null

  return (
    <div className={cn(className)}>
      {heading ? (
        <header className="mb-8">
          <h1 className="text-[42px] font-bold tracking-tight text-foreground">{heading}</h1>
        </header>
      ) : null}

      <CardInstantPreviewList
        items={items}
        activeId={activeId}
        onSelect={handleSelect}
      />

      {expandedLayer}
    </div>
  )
}
