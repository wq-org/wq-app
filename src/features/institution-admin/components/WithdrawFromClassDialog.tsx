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

import { withdrawFromClassDialogTranslationKeys } from '../utils'

type WithdrawFromClassDialogProps = {
  open: boolean
  membershipRole: string
  onOpenChange: (open: boolean) => void
  onConfirmWithdraw: () => void
}

export function WithdrawFromClassDialog({
  open,
  membershipRole,
  onOpenChange,
  onConfirmWithdraw,
}: WithdrawFromClassDialogProps) {
  const { t } = useTranslation('features.institution-admin')

  const copyKeys = withdrawFromClassDialogTranslationKeys(membershipRole)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('users.withdrawFromClassDialog.title')}</DialogTitle>
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
          >
            {t('users.withdrawFromClassDialog.cancelButton')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            onClick={onConfirmWithdraw}
          >
            {t('users.withdrawFromClassDialog.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
