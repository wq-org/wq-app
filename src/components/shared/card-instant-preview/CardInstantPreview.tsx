import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CardInstantPreviewExpanded } from './CardInstantPreviewExpanded'
import { CardInstantPreviewList } from './CardInstantPreviewList'
import type { CardInstantPreviewProps } from './card-instant-preview.types'
import { CARD_INSTANT_PREVIEW_ANIMATION_DURATION_MS } from './card-instant-preview.types'

export function CardInstantPreview({
  heading = 'Today',
  avatarSrc,
  avatarAlt = 'Profile',
  items,
  className,
  onOpen,
  onClose,
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

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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
            />
          </>,
          document.body,
        )
      : null

  return (
    <div className={cn('relative mx-auto w-full max-w-[990px] px-6', className)}>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-[42px] font-bold tracking-tight text-neutral-900">{heading}</h1>
        {avatarSrc ? (
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={avatarSrc}
              alt={avatarAlt}
            />
            <AvatarFallback>{avatarAlt.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-neutral-200 text-neutral-600">WQ</AvatarFallback>
          </Avatar>
        )}
      </header>

      <CardInstantPreviewList
        items={items}
        activeId={activeId}
        onSelect={handleSelect}
      />

      {expandedLayer}
    </div>
  )
}
