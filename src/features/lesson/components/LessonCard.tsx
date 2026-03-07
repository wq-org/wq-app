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
  const { t, i18n } = useTranslation('features.course')

  return (
    <InfoCard
      className="max-w-[350px]"
      subheading="Lesson"
      title={lesson.title}
      description={lesson.description?.trim() || t('lessonTable.noDescription')}
      content={formatRelativeUpdatedTime(lesson.updated_at, lesson.created_at, i18n.language)}
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
            {t('card.open')}
          </Text>
        </Button>
      }
    />
  )
}
