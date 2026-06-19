import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

type ConfirmDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  cancelLabel: string
  confirmLabel: string
  deletingLabel: string
  onConfirm: () => Promise<void>
  icon?: LucideIcon
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  confirmLabel,
  deletingLabel,
  onConfirm,
  icon: Icon = Trash2,
}: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (isDeleting) return
    onOpenChange(next)
  }

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={!isDeleting}
      >
        <DialogHeader className="text-left">
          <div className="flex gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <Icon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => handleOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="delete"
            className="gap-2"
            disabled={isDeleting}
            onClick={() => void handleConfirm()}
          >
            {isDeleting ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : (
              <Trash2
                className="size-4"
                aria-hidden
              />
            )}
            {isDeleting ? deletingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
