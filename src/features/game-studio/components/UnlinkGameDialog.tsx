'use client'

import { Unlink } from 'lucide-react'
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
import { Spinner } from '@/components/ui/spinner'

import { useUnlinkGameDialog } from '../hooks/useUnlinkGameDialog'
import { GameCourseSelectTable } from './GameCourseSelectTable'

export type UnlinkGameDialogProps = {
  gameId: string
  linkedCourseIds?: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUnlinked?: () => void
}

export function UnlinkGameDialog({
  gameId,
  linkedCourseIds = [],
  open,
  onOpenChange,
  onUnlinked,
}: UnlinkGameDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const {
    courses,
    loading,
    selectedCourseIds,
    unlinking,
    canConfirm,
    selectCourse,
    handleConfirm,
  } = useUnlinkGameDialog({
    gameId,
    open,
    linkedCourseIds,
    onOpenChange,
    onUnlinked,
  })

  const emptyLabel =
    linkedCourseIds.length > 0
      ? t('unlinkGameDialog.loadFailed')
      : t('unlinkGameDialog.noLinkedCourse')

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <div className="flex gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <Unlink className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle>{t('unlinkGameDialog.title')}</DialogTitle>
              <DialogDescription>{t('unlinkGameDialog.description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <GameCourseSelectTable
          courses={courses}
          loading={loading}
          selectedCourseIds={selectedCourseIds}
          onSelectCourse={selectCourse}
          emptyLabel={emptyLabel}
          kursenameColumnLabel={t('unlinkGameDialog.kursename')}
          selectAllAriaLabel={t('unlinkGameDialog.selectCourseColumn')}
          selectCourseAriaLabel={(title) => t('unlinkGameDialog.selectCourseAriaLabel', { title })}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={unlinking}
          >
            {t('unlinkGameDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="delete"
            disabled={!canConfirm}
            onClick={() => void handleConfirm()}
          >
            {unlinking ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : null}
            {unlinking ? t('unlinkGameDialog.unlinking') : t('unlinkGameDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
