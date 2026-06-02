import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteFile } from '../api/filesApi'
import type { FileItem } from '../types/files.types'

type CloudDeleteDialogPhase = 'confirm' | 'blocked'

export type CloudDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  file: FileItem
  onDeleted: () => void
}

export function CloudDeleteDialog({ open, onOpenChange, file, onDeleted }: CloudDeleteDialogProps) {
  const { t } = useTranslation('features.cloud')
  const [phase, setPhase] = useState<CloudDeleteDialogPhase>('confirm')
  const [blockedMessage, setBlockedMessage] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPhase('confirm')
      setBlockedMessage('')
      setIsDeleting(false)
    }
    onOpenChange(next)
  }

  const handleDelete = async () => {
    if (!file.storagePath) {
      toast.error(t('delete.errorToast'))
      return
    }
    setIsDeleting(true)
    const result = await deleteFile(file.storagePath)
    setIsDeleting(false)
    if (!result.success) {
      setBlockedMessage(result.error ?? t('delete.blockedFallback'))
      setPhase('blocked')
      return
    }
    toast.success(t('delete.successToast'))
    onDeleted()
    handleOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        {phase === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('delete.confirmTitle')}</DialogTitle>
              <DialogDescription>
                {t('delete.confirmBody', { filename: file.filename })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => handleOpenChange(false)}
              >
                {t('delete.cancel')}
              </Button>
              <Button
                type="button"
                variant="delete"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {t('delete.confirmCta')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('delete.blockedTitle')}</DialogTitle>
              <DialogDescription>{blockedMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {t('delete.close')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
