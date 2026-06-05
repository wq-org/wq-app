'use client'

import { Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Text } from '@/components/ui/text'

import { useCoursePublishDialog } from '../../hooks/useCoursePublishDialog'

export type CoursePublishReleaseDialogVariant = 'first' | 'patch' | 'major'

export type CoursePublishReleaseDialogProps = {
  courseId: string
  variant: CoursePublishReleaseDialogVariant
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublished?: () => void
}

const TITLE_KEYS: Record<CoursePublishReleaseDialogVariant, string> = {
  first: 'settings.publishDialog.title',
  patch: 'settings.publishPatchDialog.title',
  major: 'settings.publishMajorDialog.title',
}

const DESCRIPTION_KEYS: Record<CoursePublishReleaseDialogVariant, string> = {
  first: 'settings.publishDialog.description',
  patch: 'settings.publishPatchDialog.description',
  major: 'settings.publishMajorDialog.description',
}

const CONFIRM_KEYS: Record<CoursePublishReleaseDialogVariant, string> = {
  first: 'settings.publishDialog.confirm',
  patch: 'settings.publishPatchDialog.confirm',
  major: 'settings.publishMajorDialog.confirm',
}

export function CoursePublishReleaseDialog({
  courseId,
  variant,
  open,
  onOpenChange,
  onPublished,
}: CoursePublishReleaseDialogProps) {
  const { t } = useTranslation('features.course')
  const {
    classrooms,
    loading,
    selectedIds,
    selectedCount,
    allSelected,
    publishing,
    canConfirm,
    emptyLabel,
    toggleClassroom,
    toggleAll,
    handleConfirm,
  } = useCoursePublishDialog({ courseId, open, onOpenChange, onPublished })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(TITLE_KEYS[variant])}</DialogTitle>
          <DialogDescription>{t(DESCRIPTION_KEYS[variant])}</DialogDescription>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto rounded-lg border">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner
                variant="gray"
                size="sm"
              />
            </div>
          ) : classrooms.length === 0 ? (
            <Text
              as="p"
              variant="small"
              className="px-4 py-8 text-center text-muted-foreground"
            >
              {emptyLabel}
            </Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(value) => toggleAll(value === true)}
                      aria-label={t('settings.publishDialog.selectAllAriaLabel')}
                    />
                  </TableHead>
                  <TableHead>{t('settings.publishDialog.classroomColumn')}</TableHead>
                  <TableHead className="text-right">
                    {t('settings.publishDialog.studentsColumn')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom) => {
                  const checked = selectedIds.has(classroom.id)
                  return (
                    <TableRow key={classroom.id}>
                      <TableCell>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => toggleClassroom(classroom.id, value === true)}
                          aria-label={t('settings.publishDialog.selectClassroomAriaLabel', {
                            title: classroom.title,
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <Text
                          as="span"
                          variant="small"
                        >
                          {classroom.title}
                        </Text>
                      </TableCell>
                      <TableCell className="text-right">
                        <Text
                          as="span"
                          variant="small"
                          muted
                        >
                          {classroom.studentCount}
                        </Text>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <Text
          as="p"
          variant="small"
          className="text-muted-foreground"
        >
          {t('settings.publishDialog.selectionHint', { count: selectedCount })}
        </Text>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={publishing}
          >
            {t('settings.publishDialog.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            className="gap-2"
            disabled={!canConfirm}
            onClick={() => void handleConfirm()}
          >
            {publishing ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : (
              <Upload
                className="size-4"
                aria-hidden
              />
            )}
            {publishing
              ? t('settings.publishing')
              : t(CONFIRM_KEYS[variant], { count: selectedCount })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function CoursePublishPatchDialog(props: Omit<CoursePublishReleaseDialogProps, 'variant'>) {
  return (
    <CoursePublishReleaseDialog
      {...props}
      variant="patch"
    />
  )
}

export function CoursePublishMajorDialog(props: Omit<CoursePublishReleaseDialogProps, 'variant'>) {
  return (
    <CoursePublishReleaseDialog
      {...props}
      variant="major"
    />
  )
}
