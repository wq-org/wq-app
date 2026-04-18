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

type AssignClassGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirmAssign: () => void
}

export function AssignClassGroupDialog({
  open,
  onOpenChange,
  onConfirmAssign,
}: AssignClassGroupDialogProps) {
  const { t } = useTranslation('features.institution-admin')
  const description = t('users.assignClassGroupDialog.description').trim()

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('users.assignClassGroupDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('users.assignClassGroupDialog.title')}
          </DialogDescription>
        </DialogHeader>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : (
          <div
            className="min-h-16 rounded-md border border-dashed border-muted-foreground/25 bg-muted/20"
            aria-hidden
          />
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('users.assignClassGroupDialog.cancelButton')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={onConfirmAssign}
          >
            {t('users.assignClassGroupDialog.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
