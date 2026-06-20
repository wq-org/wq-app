import { AlertCircle, CircleCheck } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export type ContactInquiryResultOutcome = 'success' | 'error'

type ContactInquiryResultDialogProps = {
  outcome: ContactInquiryResultOutcome | null
  errorMessage?: string
  onClose: () => void
}

export function ContactInquiryResultDialog({
  outcome,
  errorMessage,
  onClose,
}: ContactInquiryResultDialogProps) {
  const { t } = useTranslation('navigation')
  const isSuccess = outcome === 'success'
  const Icon = isSuccess ? CircleCheck : AlertCircle

  const title = isSuccess
    ? t('landing.contact.form.dialog.success.title')
    : t('landing.contact.form.dialog.error.title')

  const description = isSuccess
    ? t('landing.contact.form.dialog.success.description')
    : errorMessage?.trim() || t('landing.contact.form.dialog.error.description')

  return (
    <Dialog
      open={outcome != null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center gap-4 sm:items-start">
          <Icon
            aria-hidden
            className={cn('size-12 shrink-0', isSuccess ? 'text-emerald-500' : 'text-destructive')}
          />
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="default"
            onClick={onClose}
          >
            {t('landing.contact.form.dialog.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
