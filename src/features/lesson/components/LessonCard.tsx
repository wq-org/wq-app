import { useCallback } from 'react'
import { StickyNote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import type { ThemeId } from '@/lib/themes'
import { getThemeBackgroundStyle } from '@/lib/themes'
import type { Lesson } from '../types/lesson.types'
import { useLessonPrefetch } from '../hooks/useLessonPrefetch'
import { formatRelativeUpdatedTime } from '../utils/relativeTime'

export interface LessonCardProps {
  lesson: Lesson
  themeId?: ThemeId
  onOpen?: (lessonId: string) => void
}

export function LessonCard({ lesson, themeId, onOpen }: LessonCardProps) {
  const { t, i18n } = useTranslation(['features.lesson', 'features.course'])
  const prefetchLesson = useLessonPrefetch()
  const description =
    lesson.description?.trim() ||
    t('lessonTable.noDescription', { ns: 'features.course', defaultValue: 'No description' })
  const updatedText = formatRelativeUpdatedTime(
    lesson.updated_at,
    lesson.created_at,
    i18n.language,
    {
      updatedRecently: t('card.updatedRecently', {
        ns: 'features.lesson',
        defaultValue: 'Updated recently',
      }),
      updatedWithRelative: (relativeValue) =>
        t('card.updatedRelative', {
          ns: 'features.lesson',
          defaultValue: 'Updated {{relative}}',
          relative: relativeValue,
        }),
    },
  )

  const handlePrefetch = useCallback(() => {
    prefetchLesson(lesson.id)
  }, [prefetchLesson, lesson.id])

  const handleOpen = useCallback(() => {
    onOpen?.(lesson.id)
  }, [onOpen, lesson.id])

  return (
    <Card
      className="w-full min-w-0 rounded-xl border border-border bg-card shadow-sm"
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {t('card.subheading', { ns: 'features.lesson', defaultValue: 'Lesson' })}
        </p>

        <div className="flex items-start gap-3">
          <Avatar
            size="tile"
            className="size-11 shrink-0 rounded-lg sm:size-12"
            style={getThemeBackgroundStyle(themeId)}
          >
            <AvatarFallback
              className="flex size-full items-center justify-center rounded-lg bg-transparent text-white"
              style={getThemeBackgroundStyle(themeId)}
            >
              <StickyNote className="size-5 text-white sm:size-[22px]" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-snug text-foreground">
              {lesson.title}
            </span>
            <p className="mt-1 line-clamp-2 text-left text-[13px] leading-snug text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <span className="min-w-0 text-left text-[11px] leading-tight text-muted-foreground sm:text-xs">
            {updatedText}
          </span>
          <Button
            variant="darkblue"
            size="sm"
            className="shrink-0"
            onClick={handleOpen}
            onFocus={handlePrefetch}
            onMouseEnter={handlePrefetch}
          >
            <Text
              as="span"
              variant="small"
            >
              {t('card.open', { ns: 'features.course', defaultValue: 'Open' })}
            </Text>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
