'use client'

import { useState } from 'react'
import { GlobeOffIcon } from '@/components/shared/icons'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type GameUnpublishConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}

export function GameUnpublishConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: GameUnpublishConfirmDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!confirming) onOpenChange(next)
      }}
    >
      <DialogContent showCloseButton={!confirming}>
        <DialogHeader className="text-left">
          <div className="flex gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <GlobeOffIcon className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle>{t('editorCanvas.unpublishDialog.title')}</DialogTitle>
              <DialogDescription>{t('editorCanvas.unpublishDialog.description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={confirming}
            onClick={() => onOpenChange(false)}
          >
            {t('editorCanvas.unpublishDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="delete"
            disabled={confirming}
            onClick={() => void handleConfirm()}
          >
            {confirming
              ? t('editorCanvas.unpublishDialog.confirming')
              : t('editorCanvas.unpublishDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
