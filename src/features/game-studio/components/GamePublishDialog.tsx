import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Text } from '@/components/ui/text'
import { getThemeBackgroundStyle } from '@/lib/themes'

import { useTeacherPublishedCourses } from '../hooks/useTeacherPublishedCourses'

type GamePublishDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacherId: string | undefined
  linkedCourseIds?: string[]
  onPublish: (courseIds: string[]) => Promise<void>
}

export function GamePublishDialog({
  open,
  onOpenChange,
  teacherId,
  linkedCourseIds = [],
  onPublish,
}: GamePublishDialogProps) {
  const { t } = useTranslation('features.gameStudio')
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)

  const { courses, loading: coursesLoading } = useTeacherPublishedCourses(teacherId, open)

  useEffect(() => {
    if (open) setSelectedCourseIds([...linkedCourseIds])
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    )
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublish(selectedCourseIds)
      setSelectedCourseIds([])
      onOpenChange(false)
    } catch {
      toast.error(t('publishDialog.errorToast'))
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPublishing) onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('publishDialog.title')}</DialogTitle>
          <DialogDescription>{t('publishDialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Text
            as="p"
            variant="small"
            className="font-medium"
          >
            {t('publishDialog.courseSectionLabel')}
          </Text>

          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner
                variant="gray"
                size="sm"
              />
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-lg border px-4 py-6 text-center">
              <Text
                as="p"
                variant="small"
                muted
              >
                {t('publishDialog.noCoursesHint')}
              </Text>
            </div>
          ) : (
            <BlurredScrollArea
              className="max-h-64 rounded-lg border"
              fadeColor="var(--card)"
            >
              <Table>
                <TableBody>
                  {courses.map((course) => {
                    const isSelected = selectedCourseIds.includes(course.id)
                    return (
                      <TableRow
                        key={course.id}
                        className="cursor-pointer"
                        onClick={() => handleToggleCourse(course.id)}
                        data-state={isSelected ? 'selected' : undefined}
                      >
                        <TableCell className="w-10 pr-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleCourse(course.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={t('publishDialog.selectCourseAriaLabel', {
                              title: course.title,
                            })}
                          />
                        </TableCell>
                        <TableCell className="w-10 px-2">
                          <div
                            className="size-8 rounded-lg"
                            style={getThemeBackgroundStyle(course.theme_id)}
                            aria-hidden
                          />
                        </TableCell>
                        <TableCell className="min-w-0">
                          <p className="truncate text-sm font-medium leading-tight">
                            {course.title}
                          </p>
                          {course.description && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {course.description}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </BlurredScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPublishing}
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="darkblue"
            className="gap-2"
            disabled={isPublishing}
            onClick={() => void handlePublish()}
          >
            {isPublishing ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : (
              <ArrowUp
                className="size-4"
                aria-hidden
              />
            )}
            {isPublishing ? t('publishDialog.publishing') : t('publishDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
