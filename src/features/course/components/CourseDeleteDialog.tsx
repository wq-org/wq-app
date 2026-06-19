import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'

import { deleteCourse } from '../api/coursesApi'

type CourseDeleteDialogProps = {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function CourseDeleteDialog({
  courseId,
  open,
  onOpenChange,
  onDeleted,
}: CourseDeleteDialogProps) {
  const { t } = useTranslation('features.course')

  const handleConfirm = async () => {
    try {
      await deleteCourse(courseId)
      toast.success(t('cardMenu.toasts.deleteSuccess'))
      onDeleted?.()
    } catch {
      toast.error(t('settings.toasts.deleteFailed'))
      throw new Error('delete failed')
    }
  }

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('cardMenu.deleteDialog.title')}
      description={t('cardMenu.deleteDialog.description')}
      cancelLabel={t('cardMenu.deleteDialog.cancel')}
      confirmLabel={t('cardMenu.deleteDialog.confirm')}
      deletingLabel={t('cardMenu.deleteDialog.deleting')}
      onConfirm={handleConfirm}
    />
  )
}
