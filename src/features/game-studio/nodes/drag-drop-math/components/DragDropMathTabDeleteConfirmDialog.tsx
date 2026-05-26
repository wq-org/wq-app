import { useTranslation } from 'react-i18next'
import { Layers2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type DragDropMathTabDeleteConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DragDropMathTabDeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: DragDropMathTabDeleteConfirmDialogProps) {
  const { t } = useTranslation('features.gameStudio')

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader className="text-left">
          <div className="flex gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <Layers2 className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle>{t('dragDropMathEditor.deleteExerciseTabDialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('dragDropMathEditor.deleteExerciseTabDialogDescription')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('dragDropMathEditor.deleteExerciseTabDialogCancel')}
          </Button>
          <Button
            type="button"
            variant="delete"
            onClick={handleConfirm}
          >
            {t('dragDropMathEditor.deleteExerciseTabDialogConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
