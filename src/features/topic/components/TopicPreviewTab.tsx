import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { LessonCardList, type Lesson } from '@/features/lesson'
import type { ThemeId } from '@/lib/themes'

export interface TopicPreviewTabProps {
  lessons: Lesson[]
  themeId?: ThemeId
  onLessonOpen?: (lessonId: string) => void
  title?: string
  description?: string
}

export default function TopicPreviewTab({
  lessons,
  themeId,
  onLessonOpen,
  title,
  description,
}: TopicPreviewTabProps) {
  const { t } = useTranslation('features.course')

  return (
    <div className="flex flex-col gap-6">
      {title ? (
        <div className="space-y-1">
          <div className="flex gap-2">
            <Text
              color={themeId}
              as="h1"
              variant="h1"
              className="text-2xl font-semibold"
            >
              {t('page.topicLabel', { defaultValue: 'Topic:' })}
            </Text>
            <Text
              as="h1"
              variant="h1"
              className="text-2xl font-semibold"
            >
              {title}
            </Text>
          </div>
          {description ? (
            <Text
              as="p"
              variant="body"
              className="text-muted-foreground"
            >
              {description}
            </Text>
          ) : null}
        </div>
      ) : null}

      <Text
        as="p"
        variant="body"
        className="text-2xl"
      >
        {t('page.lessonsTitle')}
      </Text>

      <LessonCardList
        lessons={lessons}
        themeId={themeId}
        onLessonOpen={onLessonOpen}
      />
    </div>
  )
}
