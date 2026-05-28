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

export type OpenQuestionSubmitConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/** Confirmation before grading the current preview answer (irreversible for this question). */
export function OpenQuestionSubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: OpenQuestionSubmitConfirmDialogProps) {
  const { t } = useTranslation('features.gameStudio')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('openQuestionGamePreview.submitConfirmDialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('openQuestionGamePreview.submitConfirmDialogBody')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('openQuestionGamePreview.submitConfirmDialogCancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {t('openQuestionGamePreview.submitConfirmDialogConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
