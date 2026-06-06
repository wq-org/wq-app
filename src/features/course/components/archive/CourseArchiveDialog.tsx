'use client'

import { AlertCircle, AlertTriangle, Archive, Info } from 'lucide-react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

import { useCourseArchiveDialog } from '../../hooks/useCourseArchiveDialog'
import type { CourseArchiveVersionOption } from '../../types/course-version.types'
import { formatPublishedAt } from '../../utils/courseVersion.utils'

type CourseArchiveDialogProps = {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onArchived?: () => void
}

export function CourseArchiveDialog({
  courseId,
  open,
  onOpenChange,
  onArchived,
}: CourseArchiveDialogProps) {
  const { t, i18n } = useTranslation('features.course')
  const {
    options,
    selectedTarget,
    isLoading,
    isArchiving,
    error,
    canConfirm,
    handleSelectVersion,
    handleConfirm,
    reload,
  } = useCourseArchiveDialog({ courseId, open, onOpenChange, onArchived })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-[oklch(var(--oklch-orange)/0.14)] text-[oklch(var(--oklch-orange))]">
            <Archive
              className="size-6"
              aria-hidden
            />
          </div>
          <div className="space-y-2 text-left">
            <DialogTitle>{t('settings.archiveDialog.title')}</DialogTitle>
            <DialogDescription>{t('settings.archiveDialog.description')}</DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner
              variant="gray"
              size="sm"
            />
          </div>
        ) : error ? (
          <ArchiveLoadError onRetry={() => void reload()} />
        ) : options.versions.length > 0 ? (
          <RadioGroup
            value={selectedTarget?.id ?? ''}
            onValueChange={handleSelectVersion}
            className="max-h-[24rem] overflow-y-auto pr-1"
          >
            {options.versions.map((version) => (
              <ArchiveVersionRow
                key={version.id}
                version={version}
                language={i18n.language}
              />
            ))}
          </RadioGroup>
        ) : (
          <div className="rounded-lg border px-4 py-8 text-center">
            <Text
              as="p"
              variant="small"
              muted
            >
              {t('settings.archiveDialog.empty')}
            </Text>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="orange"
            className="gap-2"
            disabled={!canConfirm}
            onClick={() => void handleConfirm()}
          >
            {isArchiving ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : (
              <Archive
                className="size-4"
                aria-hidden
              />
            )}
            {isArchiving
              ? t('settings.archiveDialog.archiving')
              : t('settings.archiveDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type ArchiveVersionRowProps = {
  version: CourseArchiveVersionOption
  language: string
}

function ArchiveVersionRow({ version, language }: ArchiveVersionRowProps) {
  const { t } = useTranslation('features.course')
  const activeClassroomLabel = formatActiveClassroomLabel(version.activeClassroomTitles, t)
  const statusLabel = version.isLatestPublished
    ? t('settings.archiveDialog.versionStatus.latest')
    : activeClassroomLabel

  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border px-4 py-3 transition-colors',
        'hover:bg-muted/40 has-[[data-state=checked]]:border-[oklch(var(--oklch-orange))] has-[[data-state=checked]]:bg-[oklch(var(--oklch-orange)/0.08)]',
        !version.isEligible && 'cursor-not-allowed opacity-70 hover:bg-transparent',
      )}
    >
      <RadioGroupItem
        value={version.id}
        disabled={!version.isEligible}
        className="mt-1"
        aria-label={t('settings.archiveDialog.selectVersionAriaLabel', {
          version: version.versionNo,
        })}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Text
              as="span"
              variant="body"
              className="font-semibold"
            >
              {t('history.versionBadge', { version: version.versionNo })}
            </Text>
            <Text
              as="span"
              variant="small"
              muted
            >
              {version.publishedAt ? formatPublishedAt(version.publishedAt, language) : '—'}
            </Text>
          </div>
          <Text
            as="span"
            variant="small"
            className="text-left font-medium sm:text-right"
          >
            {statusLabel}
          </Text>
        </div>

        {version.blockReason ? (
          <ArchiveVersionHint
            icon="info"
            text={t(`settings.archiveDialog.blockReasons.${version.blockReason}`)}
          />
        ) : version.activeClassroomTitles.length > 0 ? (
          <ArchiveVersionHint
            icon="warning"
            text={t('settings.archiveDialog.activeClassroomWarning')}
          />
        ) : null}
      </div>
    </label>
  )
}

type ArchiveVersionHintProps = {
  icon: 'info' | 'warning'
  text: string
}

function ArchiveVersionHint({ icon, text }: ArchiveVersionHintProps) {
  const Icon = icon === 'warning' ? AlertTriangle : Info

  return (
    <div className="mt-2 flex items-start gap-2 text-muted-foreground">
      <Icon
        className={cn(
          'mt-0.5 size-4 shrink-0',
          icon === 'warning' && 'text-[oklch(var(--oklch-orange))]',
        )}
        aria-hidden
      />
      <Text
        as="p"
        variant="small"
        muted
      >
        {text}
      </Text>
    </div>
  )
}

type ArchiveLoadErrorProps = {
  onRetry: () => void
}

function ArchiveLoadError({ onRetry }: ArchiveLoadErrorProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className="rounded-lg border px-4 py-5">
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            variant="small"
            className="font-medium"
          >
            {t('settings.archiveDialog.loadError')}
          </Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            {t('settings.archiveDialog.retry')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatActiveClassroomLabel(
  classroomTitles: string[],
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (classroomTitles.length === 0) {
    return t('settings.archiveDialog.versionStatus.inactive')
  }

  if (classroomTitles.length === 1) {
    return t('settings.archiveDialog.versionStatus.singleClassroom', {
      classroom: classroomTitles[0],
    })
  }

  return t('settings.archiveDialog.versionStatus.multipleClassrooms', {
    classroom: classroomTitles[0],
    count: classroomTitles.length - 1,
  })
}
