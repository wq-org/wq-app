import { useState } from 'react'
import { Archive } from 'lucide-react'
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

import { archiveGame } from '../api/gameStudioApi'

type GameArchiveDialogProps = {
  gameId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onArchived?: () => void
}

export function GameArchiveDialog({
  gameId,
  open,
  onOpenChange,
  onArchived,
}: GameArchiveDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const [isArchiving, setIsArchiving] = useState(false)

  const handleConfirm = async () => {
    setIsArchiving(true)
    try {
      await archiveGame(gameId)
      toast.success(t('archiveDialog.successToast'))
      onOpenChange(false)
      onArchived?.()
    } catch {
      toast.error(t('archiveDialog.errorToast'))
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-[oklch(var(--oklch-orange)/0.14)] text-[oklch(var(--oklch-orange))]">
            <Archive
              className="size-6"
              aria-hidden
            />
          </div>
          <div className="space-y-2 text-left">
            <DialogTitle>{t('archiveDialog.title')}</DialogTitle>
            <DialogDescription>{t('archiveDialog.description')}</DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isArchiving}
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="orange"
            className="gap-2"
            disabled={isArchiving}
            onClick={() => void handleConfirm()}
          >
            {isArchiving ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : (
              <Archive
                className="size-4"
                aria-hidden
              />
            )}
            {isArchiving ? t('archiveDialog.archiving') : t('archiveDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
