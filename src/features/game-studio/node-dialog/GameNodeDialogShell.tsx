import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type GameNodeDialogShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Shared dialog frame all node dialogs use. Body is a slot — node-specific
 * editors render inside `children`. Empty by default per the registry pattern.
 */
export function GameNodeDialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: GameNodeDialogShellProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className={className ?? 'sm:max-w-2xl'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="py-2">{children}</div>
        {footer ? <div className="pt-4">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
