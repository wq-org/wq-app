import { PartyPopper } from 'lucide-react'
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

export type NewInstitutionWizardSuccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminEmail: string
  onDone: () => void
}

export function NewInstitutionWizardSuccessDialog({
  open,
  onOpenChange,
  adminEmail,
  onDone,
}: NewInstitutionWizardSuccessDialogProps) {
  const { t } = useTranslation('features.admin')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-4 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start">
            <div
              className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <PartyPopper
                className="size-8"
                strokeWidth={1.75}
              />
            </div>
          </div>
          <DialogTitle>{t('wizard.success.title')}</DialogTitle>
          <DialogDescription className="text-balance">
            {t('wizard.success.description', { email: adminEmail })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button
            type="button"
            variant="darkblue"
            className="w-full sm:w-auto"
            onClick={onDone}
          >
            {t('wizard.success.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
