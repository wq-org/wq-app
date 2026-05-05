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
        <div className="grid max-h-[80vh] grid-cols-1 overflow-y-auto md:grid-cols-10">
          <div
            className={cn('border-b p-6 md:col-span-7 md:border-r md:border-b-0', leftClassName)}
          >
            {leftChildren}
          </div>
          <div className={cn('bg-muted/20 p-6 md:col-span-3', rightClassName)}>{rightChildren}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
