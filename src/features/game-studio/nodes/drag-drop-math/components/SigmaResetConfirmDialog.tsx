import { useTranslation } from 'react-i18next'
import { CircleSlash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export type SigmaResetConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/** Warns before removing the entire sigma row (Summe badge, chips, and sum) from the canvas. */
export function SigmaResetConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: SigmaResetConfirmDialogProps) {
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
              <CircleSlash2 className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle>{t('dragDropMathEditor.sigmaResetDialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('dragDropMathEditor.sigmaResetDialogDescription')}
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
            {t('dragDropMathEditor.sigmaResetDialogCancel')}
          </Button>
          <Button
            type="button"
            variant="delete"
            onClick={handleConfirm}
          >
            {t('dragDropMathEditor.sigmaResetDialogConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
