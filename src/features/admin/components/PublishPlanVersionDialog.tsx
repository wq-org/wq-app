import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Text } from '@/components/ui/text'

type PublishPlanVersionDialogProps = {
  open: boolean
  isPublishing: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (changeNote: string) => Promise<void>
}

function PublishPlanVersionDialog({
  open,
  isPublishing,
  onOpenChange,
  onConfirm,
}: PublishPlanVersionDialogProps) {
  const { t } = useTranslation('features.admin')
  const [changeNote, setChangeNote] = useState('')

  const handleConfirm = async () => {
    await onConfirm(changeNote)
    setChangeNote('')
  }

  const handleOpenChange = (next: boolean) => {
    if (!isPublishing) {
      setChangeNote('')
      onOpenChange(next)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('planCatalog.versions.publishDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('planCatalog.versions.publishDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Text
            as="label"
            variant="small"
            className="font-medium"
          >
            {t('planCatalog.versions.publishDialog.changeNoteLabel')}
          </Text>
          <Textarea
            value={changeNote}
            onChange={(e) => setChangeNote(e.target.value)}
            placeholder={t('planCatalog.versions.publishDialog.changeNotePlaceholder')}
            rows={3}
            disabled={isPublishing}
            className="resize-none"
          />
          <Text
            as="p"
            variant="small"
            color="muted"
          >
            {t('planCatalog.versions.publishDialog.changeNoteHint')}
          </Text>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPublishing}
            onClick={() => handleOpenChange(false)}
          >
            {t('planCatalog.versions.publishDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            disabled={isPublishing}
            onClick={() => void handleConfirm()}
          >
            {isPublishing
              ? t('planCatalog.versions.publishDialog.publishing')
              : t('planCatalog.versions.publishDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PublishPlanVersionDialog }
