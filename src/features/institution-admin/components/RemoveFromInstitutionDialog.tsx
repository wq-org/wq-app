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
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'

import { removeFromInstitutionDialogTranslationKeys } from '../utils'

type RemoveFromInstitutionDialogProps = {
  open: boolean
  membershipRole: string
  isRemoving: boolean
  onOpenChange: (open: boolean) => void
  onConfirmRemove: () => void | Promise<void>
}

export function RemoveFromInstitutionDialog({
  open,
  membershipRole,
  isRemoving,
  onOpenChange,
  onConfirmRemove,
}: RemoveFromInstitutionDialogProps) {
  const { t } = useTranslation('features.institution-admin')

  const copyKeys = removeFromInstitutionDialogTranslationKeys(membershipRole)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('users.removeFromInstitutionDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">{t(copyKeys.roleLabelKey)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t(copyKeys.roleLabelKey)}
          </p>
          <p className="text-sm text-muted-foreground">{t(copyKeys.bodyKey)}</p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            {t('users.removeFromInstitutionDialog.cancelButton')}
          </Button>
          <HoldToDeleteButton
            variant="delete"
            holdDuration={1500}
            loading={isRemoving}
            disabled={isRemoving}
            onDelete={onConfirmRemove}
          >
            {isRemoving
              ? t('users.removeFromInstitutionDialog.confirmingButton')
              : t('users.removeFromInstitutionDialog.holdButton')}
          </HoldToDeleteButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
