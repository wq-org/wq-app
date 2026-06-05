'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowUpCircle } from 'lucide-react'
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
import { Text } from '@/components/ui/text'

export type CourseReleaseConfirmationVariant = 'major'

type CourseReleaseConfirmationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  variant?: CourseReleaseConfirmationVariant
  nextVersionNo?: number | null
}

const ICONS: Record<CourseReleaseConfirmationVariant, LucideIcon> = {
  major: ArrowUpCircle,
}

export function CourseReleaseConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  variant = 'major',
  nextVersionNo,
}: CourseReleaseConfirmationDialogProps) {
  const { t } = useTranslation('features.course')
  const Icon = ICONS[variant]

  const handleConfirm = () => {
    onOpenChange(false)
    onConfirm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Icon
              className="size-6"
              aria-hidden
            />
          </div>
          <div className="space-y-2 text-left">
            <DialogTitle>{t(`settings.releaseConfirmation.${variant}.title`)}</DialogTitle>
            <DialogDescription>
              {t(`settings.releaseConfirmation.${variant}.description`, {
                version: nextVersionNo ?? '—',
              })}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 px-4 py-3">
          <Text
            as="p"
            variant="small"
            className="font-medium"
          >
            {t(`settings.releaseConfirmation.${variant}.technicalTitle`)}
          </Text>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {(
              t(`settings.releaseConfirmation.${variant}.technicalPoints`, {
                returnObjects: true,
              }) as string[]
            ).map((point) => (
              <li key={point}>
                <Text
                  as="span"
                  variant="small"
                  muted
                >
                  {point}
                </Text>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t(`settings.releaseConfirmation.${variant}.cancel`)}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            className="gap-2"
            onClick={handleConfirm}
          >
            <Icon
              className="size-4"
              aria-hidden
            />
            {t(`settings.releaseConfirmation.${variant}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
