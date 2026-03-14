import { StickyNote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import type { ThemeId } from '@/lib/themes'
import { getThemeBackgroundStyle } from '@/lib/themes'
import type { Lesson } from '../types/lesson.types'
import { formatRelativeUpdatedTime } from '../utils/relativeTime'

export interface LessonCardProps {
  lesson: Lesson
  themeId?: ThemeId
  onOpen?: (lessonId: string) => void
}

export function LessonCard({ lesson, themeId, onOpen }: LessonCardProps) {
  const { t, i18n } = useTranslation(['features.lesson', 'features.course'])
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

  return (
    <Card className="w-full max-w-[350px] rounded-2xl border bg-white shadow-sm">
      <CardContent className="flex h-full min-h-[180px] flex-col">
        <p className="text-sm font-normal leading-none text-gray-400">
          {t('card.subheading', { ns: 'features.lesson', defaultValue: 'Lesson' })}
        </p>

        <div className="mt-4 flex items-start gap-3">
          <Avatar
            className={cn('h-11 w-11 shrink-0 rounded-xl')}
            style={getThemeBackgroundStyle(themeId)}
          >
            <AvatarFallback
              className="flex items-center justify-center rounded-xl bg-transparent text-white"
              style={getThemeBackgroundStyle(themeId)}
            >
              <StickyNote className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-tight text-gray-900">
              {lesson.title}
            </span>
            <span className="block line-clamp-2 text-[13px] font-normal leading-tight text-gray-400">
              {updatedText}
            </span>
          </div>
        </div>

        <div className="mt-auto flex w-full flex-col gap-2 pt-4">
          <p className="max-w-full self-start text-left text-sm font-normal text-muted-foreground line-clamp-2">
            {description}
          </p>
          <div className="self-end shrink-0">
            <Button
              variant="ghost"
              className="border-0 text-blue-500 hover:bg-blue-100 hover:text-blue-500"
              onClick={() => onOpen?.(lesson.id)}
            >
              <Text
                as="span"
                variant="small"
              >
                {t('card.open', { ns: 'features.course', defaultValue: 'Open' })}
              </Text>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
