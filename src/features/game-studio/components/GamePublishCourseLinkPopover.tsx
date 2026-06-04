'use client'

import { useMemo } from 'react'
import { ChevronDown, Link2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { Course } from '@/features/course'

export type GamePublishCourseLinkPopoverProps = {
  courses: readonly Course[]
  loading?: boolean
  selectedCourseId: string | null
  onSelectCourse: (courseId: string | null) => void
}

export function GamePublishCourseLinkPopover({
  courses,
  loading = false,
  selectedCourseId,
  onSelectCourse,
}: GamePublishCourseLinkPopoverProps) {
  const { t } = useTranslation('features.gameStudio')

  const hasCourses = courses.length > 0
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  )

  const triggerLabel = selectedCourse ? selectedCourse.title : t('publishDrawer.linkCourseTrigger')

  if (!hasCourses) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between gap-2 font-normal"
          disabled
        >
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            <Link2 className="size-4 shrink-0 opacity-60" />
            <span className="truncate">{t('publishDrawer.linkCourseTrigger')}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-40" />
        </Button>
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('publishDrawer.linkCourseEmptyHint')}
        </Text>
      </div>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between gap-2 font-normal"
          disabled={loading}
          aria-label={t('publishDrawer.linkCourseAriaLabel')}
        >
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            <Link2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {loading ? t('publishDrawer.linkCourseLoading') : triggerLabel}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] max-h-64 overflow-y-auto p-2"
      >
        <PopoverHeader className="px-1 pb-1">
          <PopoverTitle>{t('publishDrawer.linkCoursePopoverTitle')}</PopoverTitle>
          <PopoverDescription>{t('publishDrawer.linkCoursePopoverHint')}</PopoverDescription>
        </PopoverHeader>
        <ul
          className="flex flex-col gap-0.5"
          role="listbox"
          aria-label={t('publishDrawer.linkCoursePopoverTitle')}
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={selectedCourseId === null}
              className={cn(
                'w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                selectedCourseId === null && 'bg-muted font-medium',
              )}
              onClick={() => onSelectCourse(null)}
            >
              {t('publishDrawer.linkCourseNone')}
            </button>
          </li>
          {courses.map((course) => (
            <li
              key={course.id}
              role="presentation"
            >
              <button
                type="button"
                role="option"
                aria-selected={selectedCourseId === course.id}
                className={cn(
                  'w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                  selectedCourseId === course.id && 'bg-muted font-medium',
                )}
                onClick={() => onSelectCourse(course.id)}
              >
                <span className="line-clamp-2">{course.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
