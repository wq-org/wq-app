import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

export type SuccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  buttonDescription: string
  /** When set, primary action navigates here then closes the dialog. */
  path?: string
  showCloseButton?: boolean
  showConfetti?: boolean
  /** Replaces the default celebration row. Omit for default emoji. */
  decoration?: ReactNode
  contentClassName?: string
  headerClassName?: string
  footerClassName?: string
  primaryButtonClassName?: string
}

function DefaultDecoration() {
  return (
    <div className="flex justify-center py-4">
      <Text
        as="span"
        variant="small"
        className="text-6xl animate-bounce"
      >
        🎉
      </Text>
    </div>
  )
}

export function SuccessDialog({
  open,
  onOpenChange,
  title,
  description,
  buttonDescription,
  path,
  showCloseButton = false,
  showConfetti = false,
  decoration,
  contentClassName,
  headerClassName,
  footerClassName,
  primaryButtonClassName,
}: SuccessDialogProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (open && showConfetti) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [open, showConfetti])

  function handlePrimary() {
    if (path) {
      navigate(path)
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className={cn('sm:max-w-md text-center', contentClassName)}
        showCloseButton={showCloseButton}
      >
        {decoration !== undefined ? decoration : <DefaultDecoration />}

        <DialogHeader className={headerClassName}>
          <DialogTitle className="text-2xl font-light">{title}</DialogTitle>
          <DialogDescription className="text-base mt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className={cn('flex justify-center pt-4', footerClassName)}>
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={handlePrimary}
            className={cn('w-full', primaryButtonClassName)}
          >
            {buttonDescription}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
