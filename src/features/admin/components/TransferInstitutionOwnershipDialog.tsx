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

import type { Institution } from '../types/institution.types'

type TransferInstitutionOwnershipDialogProps = {
  institution: Institution | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TransferInstitutionOwnershipDialog = ({
  institution,
  open,
  onOpenChange,
}: TransferInstitutionOwnershipDialogProps) => {
  const { t } = useTranslation('features.admin')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('institutions.transferOwnershipDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('institutions.transferOwnershipDialog.description', {
              name: institution?.name ?? '—',
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('institutions.transferOwnershipDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => {
              /* Transfer ownership flow not implemented yet */
            }}
          >
            {t('institutions.transferOwnershipDialog.transfer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { TransferInstitutionOwnershipDialog }
