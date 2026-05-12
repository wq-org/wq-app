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

type RevokeInstitutionInviteDialogProps = {
  open: boolean
  email: string | null
  isRevoking: boolean
  onOpenChange: (open: boolean) => void
  onConfirmRevoke: () => void | Promise<void>
}

export function RevokeInstitutionInviteDialog({
  open,
  email,
  isRevoking,
  onOpenChange,
  onConfirmRevoke,
}: RevokeInstitutionInviteDialogProps) {
  const { t } = useTranslation('features.admin')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('institutionInvites.revokeDialog.title', { defaultValue: 'Revoke invite?' })}
          </DialogTitle>
          <DialogDescription>
            {t('institutionInvites.revokeDialog.body', {
              defaultValue:
                'The emailed link will stop working. You can send a new invite to the same address afterwards.',
            })}
          </DialogDescription>
        </DialogHeader>
        {email ? <p className="text-sm font-medium text-foreground">{email}</p> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRevoking}
          >
            {t('institutionInvites.revokeDialog.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <HoldToDeleteButton
            variant="delete"
            holdDuration={1500}
            loading={isRevoking}
            disabled={isRevoking}
            onDelete={onConfirmRevoke}
          >
            {isRevoking
              ? t('institutionInvites.revokeDialog.revoking', { defaultValue: 'Revoking…' })
              : t('institutionInvites.revokeDialog.hold', { defaultValue: 'Hold to revoke' })}
          </HoldToDeleteButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
