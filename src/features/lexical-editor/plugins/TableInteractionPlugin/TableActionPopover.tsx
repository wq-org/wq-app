import type { JSX } from 'react'
import { ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { cn } from '@/lib/utils'

export type PopoverAction = {
  id: string
  label: string
  icon?: JSX.Element
  shortcut?: string
  hasSubmenu?: boolean
  variant?: 'default' | 'danger'
  onSelect: () => void
}

export type TableActionPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchorRect: DOMRect | null
  actions: PopoverAction[]
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function TableActionPopover({
  open,
  onOpenChange,
  anchorRect,
  actions,
  side = 'right',
}: TableActionPopoverProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useSearchFilter(actions, query, ['label'] as const)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true })
      })
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      return
    }
    const item = listRef.current?.querySelector<HTMLElement>(`[data-action-index="${activeIndex}"]`)
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (filtered.length === 0 ? 0 : (prev + 1) % filtered.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) =>
        filtered.length === 0 ? 0 : (prev - 1 + filtered.length) % filtered.length,
      )
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const action = filtered[activeIndex]
      if (action) {
        action.onSelect()
        onOpenChange(false)
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onOpenChange(false)
    }
  }

  const virtualAnchor = useMemo(() => {
    if (!anchorRect) return null
    return (
      <div
        style={{
          position: 'fixed',
          left: anchorRect.left,
          top: anchorRect.top,
          width: anchorRect.width,
          height: anchorRect.height,
          pointerEvents: 'none',
        }}
      />
    )
  }, [anchorRect])

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
    >
      <PopoverAnchor asChild>{virtualAnchor ?? <span style={{ display: 'none' }} />}</PopoverAnchor>
      <PopoverContent
        side={side}
        align="start"
        sideOffset={6}
        className="w-64 p-1"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search actions..."
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-1 w-full rounded-md bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search table actions"
        />
        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <div className="px-2 py-3 text-xs text-muted-foreground">No actions</div>
          ) : (
            filtered.map((action, index) => (
              <button
                key={action.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                data-action-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  action.onSelect()
                  onOpenChange(false)
                }}
                onMouseDown={(event) => event.preventDefault()}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                  index === activeIndex && 'bg-accent text-accent-foreground',
                  action.variant === 'danger' && 'text-destructive',
                )}
              >
                <span className="flex items-center gap-2">
                  {action.icon ? (
                    <span className="inline-flex size-4 items-center justify-center text-muted-foreground">
                      {action.icon}
                    </span>
                  ) : null}
                  <span>{action.label}</span>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {action.shortcut ? <kbd className="font-sans">{action.shortcut}</kbd> : null}
                  {action.hasSubmenu ? <ChevronRight className="size-3.5" /> : null}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
