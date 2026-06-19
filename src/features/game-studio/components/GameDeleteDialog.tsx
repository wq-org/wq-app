import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'

import { softDeleteGame } from '../api/gameStudioApi'

type GameDeleteDialogProps = {
  gameId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function GameDeleteDialog({ gameId, open, onOpenChange, onDeleted }: GameDeleteDialogProps) {
  const { t } = useTranslation('features.gameStudio')

  const handleConfirm = async () => {
    try {
      await softDeleteGame(gameId)
      toast.success(t('deleteDialog.successToast'))
      onDeleted?.()
    } catch {
      toast.error(t('deleteDialog.errorToast'))
      throw new Error('delete failed')
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteDialog.title')}
      description={t('deleteDialog.description')}
      cancelLabel={t('deleteDialog.cancel')}
      confirmLabel={t('deleteDialog.confirm')}
      deletingLabel={t('deleteDialog.deleting')}
      onConfirm={handleConfirm}
    />
  )
}
