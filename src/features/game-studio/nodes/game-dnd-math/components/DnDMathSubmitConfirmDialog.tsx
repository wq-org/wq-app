'use client'

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

export type DnDMathSubmitConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Confirmation dialog shown before the learner submits a preview answer.
 * Submission is irreversible for the current preview run.
 */
export function DnDMathSubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: DnDMathSubmitConfirmDialogProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="accent-isolate">
        <DialogHeader>
          <DialogTitle>{t('dragDropMathGamePreview.submitConfirmDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('dragDropMathGamePreview.submitConfirmDialogBody')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('dragDropMathGamePreview.submitConfirmDialogCancel')}
          </Button>
          <Button
            type="button"
            variant="invert"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {t('dragDropMathGamePreview.submitConfirmDialogConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
