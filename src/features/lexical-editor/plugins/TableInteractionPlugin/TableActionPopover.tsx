import type { JSX } from 'react'

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export type TableActionItem = {
  id: string
  label: string
  icon?: JSX.Element
  shortcut?: string
  variant?: 'default' | 'danger'
  onSelect: () => void
}

export type TableActionSection = {
  id: string
  items: TableActionItem[]
}

export type TableActionToggle = {
  label: string
  icon: JSX.Element
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export type TableActionPopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchorRect: DOMRect | null
  headerToggle?: TableActionToggle
  sections: TableActionSection[]
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function TableActionPopover({
  open,
  onOpenChange,
  anchorRect,
  headerToggle,
  sections,
  side = 'right',
}: TableActionPopoverProps) {
  const virtualAnchor = anchorRect ? (
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
  ) : null

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
        className="w-72 p-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="space-y-1">
          {headerToggle ? (
            <>
              <ToggleRow
                icon={headerToggle.icon}
                label={headerToggle.label}
                checked={headerToggle.checked}
                onCheckedChange={headerToggle.onCheckedChange}
              />
              {sections.length > 0 ? <Separator className="my-1" /> : null}
            </>
          ) : null}

          {sections.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="space-y-1"
            >
              {section.items.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  onClose={() => onOpenChange(false)}
                />
              ))}
              {sectionIndex < sections.length - 1 ? <Separator className="my-1" /> : null}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ToggleRow({
  icon,
  label,
  checked,
  onCheckedChange,
}: TableActionToggle): JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onCheckedChange(!checked)
        }
      }}
      onMouseDown={(event) => event.preventDefault()}
      className={cn(
        'flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex size-4 items-center justify-center text-muted-foreground">
          {icon}
        </span>
        <span>{label}</span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}

function ActionRow({
  item,
  onClose,
}: {
  item: TableActionItem
  onClose: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        item.onSelect()
        onClose()
      }}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        item.variant === 'danger' && 'text-destructive hover:text-destructive',
      )}
    >
      <span className="flex items-center gap-2">
        {item.icon ? (
          <span className="inline-flex size-4 items-center justify-center text-muted-foreground">
            {item.icon}
          </span>
        ) : null}
        <span>{item.label}</span>
      </span>
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {item.shortcut ? <kbd className="font-sans">{item.shortcut}</kbd> : null}
      </span>
    </button>
  )
}
