import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { useGameStudioAgentMode } from '../hooks/useGameStudioAgentMode'

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
  const { isAgentMode } = useGameStudioAgentMode()

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className={cn(
          'flex h-[90vh] flex-col overflow-visible rounded-3xl',
          isAgentMode ? 'w-[92vw] max-w-[92vw] sm:max-w-[92vw]' : 'sm:max-w-4xl',
          className,
        )}
        {...(!description ? { 'aria-describedby': undefined } : {})}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div
          className={cn('min-h-0 flex-1 py-2', isAgentMode ? 'overflow-hidden' : 'overflow-y-auto')}
        >
          {children}
        </div>
        {footer ? <div className="shrink-0 pt-4">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  )
}
