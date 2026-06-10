import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

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

import { softDeleteGame } from '../api/gameStudioApi'

type GameDeleteDialogProps = {
  gameId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function GameDeleteDialog({ gameId, open, onOpenChange, onDeleted }: GameDeleteDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await softDeleteGame(gameId)
      toast.success(t('deleteDialog.successToast'))
      onOpenChange(false)
      onDeleted?.()
    } catch {
      toast.error(t('deleteDialog.errorToast'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Trash2
              className="size-6"
              aria-hidden
            />
          </div>
          <div className="space-y-2 text-left">
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription>{t('deleteDialog.description')}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
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
            {isDeleting ? t('deleteDialog.deleting') : t('deleteDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
