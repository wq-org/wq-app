'use client'

import { Link } from 'lucide-react'
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

import { useLinkGameDialog } from '../hooks/useLinkGameDialog'
import { GameCourseSelectTable } from './GameCourseSelectTable'

export type LinkGameDialogProps = {
  gameId: string
  linkedCourseId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onLinked?: () => void
}

export function LinkGameDialog({
  gameId,
  linkedCourseId = null,
  open,
  onOpenChange,
  onLinked,
}: LinkGameDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const { courses, loading, selectedCourseId, linking, canConfirm, selectCourse, handleConfirm } =
    useLinkGameDialog({
      gameId,
      open,
      linkedCourseId,
      onOpenChange,
      onLinked,
    })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <div className="flex gap-4">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <Link className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <DialogTitle>{t('linkGameDialog.title')}</DialogTitle>
              <DialogDescription>{t('linkGameDialog.description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <GameCourseSelectTable
          courses={courses}
          loading={loading}
          selectedCourseId={selectedCourseId}
          onSelectCourse={selectCourse}
          emptyLabel={t('linkGameDialog.emptyCourses')}
          kursenameColumnLabel={t('linkGameDialog.kursename')}
          selectAllAriaLabel={t('linkGameDialog.selectCourseColumn')}
          selectCourseAriaLabel={(title) => t('linkGameDialog.selectCourseAriaLabel', { title })}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={linking}
          >
            {t('linkGameDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            disabled={!canConfirm}
            onClick={() => void handleConfirm()}
          >
            {linking ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : null}
            {linking ? t('linkGameDialog.linking') : t('linkGameDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
