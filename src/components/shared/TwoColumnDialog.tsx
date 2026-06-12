import { useState, type ComponentProps, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type TwoColumnDialogColumnsProps = {
  leftChildren: ReactNode
  rightChildren: ReactNode
  className?: string
  leftClassName?: string
  rightClassName?: string
}

/** Shared 70/30 grid used by {@link TwoColumnDialog} and embedded dual layouts. */
export function TwoColumnDialogColumns({
  leftChildren,
  rightChildren,
  className,
  leftClassName,
  rightClassName,
}: TwoColumnDialogColumnsProps) {
  return (
    <div className={cn('grid max-h-[80vh] grid-cols-1 overflow-hidden md:grid-cols-10', className)}>
      <div
        className={cn(
          'min-h-0 border-b p-6 md:col-span-7 md:max-h-[80vh] md:overflow-y-auto md:border-r md:border-b-0',
          leftClassName,
        )}
      >
        {leftChildren}
      </div>
      <div
        className={cn(
          'min-h-0 bg-muted/20 p-6 md:col-span-3 md:max-h-[80vh] md:overflow-y-auto',
          rightClassName,
        )}
      >
        {rightChildren}
      </div>
    </div>
  )
}

type TwoColumnDialogProps = {
  title?: string
  description?: string
  leftChildren: ReactNode
  rightChildren: ReactNode
  triggerLabel?: string
  triggerButtonProps?: ComponentProps<typeof Button>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  leftClassName?: string
  rightClassName?: string
}

export function TwoColumnDialog({
  title,
  description,
  leftChildren,
  rightChildren,
  triggerLabel = 'Open dialog',
  triggerButtonProps,
  open,
  onOpenChange,
  className,
  leftClassName,
  rightClassName,
}: TwoColumnDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof open === 'boolean'
  const resolvedOpen = isControlled ? open : internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  return (
    <Dialog
      open={resolvedOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button {...triggerButtonProps}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className={cn('w-[90vw] max-w-[90vw] p-0 sm:max-w-[90vw]', className)}>
        {(title || description) && (
          <DialogHeader className="border-b px-6 py-4">
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
        )}
        <TwoColumnDialogColumns
          leftChildren={leftChildren}
          rightChildren={rightChildren}
          leftClassName={leftClassName}
          rightClassName={rightClassName}
        />
      </DialogContent>
    </Dialog>
  )
}
