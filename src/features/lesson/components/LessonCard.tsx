import { StickyNote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { InfoCard } from '@/components/shared'
import type { ThemeId } from '@/lib/themes'
import { getThemeBackgroundStyle } from '@/lib/themes'
import type { Lesson } from '../types/lesson.types'
import { formatRelativeUpdatedTime } from '../utils/relativeTime'

export interface LessonCardProps {
  lesson: Lesson
  themeId?: ThemeId
  onOpen?: (lessonId: string) => void
}

export default function LessonCard({ lesson, themeId, onOpen }: LessonCardProps) {
  const { t, i18n } = useTranslation(['features.lesson', 'features.course'])

  return (
    <InfoCard
      className="max-w-[350px]"
      subheading={t('card.subheading', { ns: 'features.lesson', defaultValue: 'Lesson' })}
      title={lesson.title}
      description={
        lesson.description?.trim() ||
        t('lessonTable.noDescription', { ns: 'features.course', defaultValue: 'No description' })
      }
      content={formatRelativeUpdatedTime(lesson.updated_at, lesson.created_at, i18n.language, {
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
      })}
      icon={<StickyNote className="h-5 w-5 text-white" />}
      iconStyle={getThemeBackgroundStyle(themeId)}
      footer={
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
      }
    />
  )
}
