import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import type { ThemeId } from '@/lib/themes'

import type { PublishedCourseTopic } from '../../types/course-version.types'
import { formatPublishedAt } from '../../utils/courseVersion.utils'

type PublishedTopicDetailsProps = {
  topic: PublishedCourseTopic
  themeId?: ThemeId
  versionNo: number
  publishedAt: Date | null
}

export function PublishedTopicDetails({
  topic,
  themeId,
  versionNo,
  publishedAt,
}: PublishedTopicDetailsProps) {
  const { t, i18n } = useTranslation('features.course')

  const publishedAtLabel = formatPublishedAt(publishedAt, i18n.language)
  const trimmedDescription = topic.description?.trim()
  const lessonCount = topic.lessons.length

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
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
            {topic.title}
          </Text>
          <Badge
            variant="secondary"
            className="w-fit"
          >
            {t('published.readOnlyVersionBadge', { version: versionNo })}
          </Badge>
        </div>
        {trimmedDescription ? (
          <Text
            as="p"
            variant="body"
            muted
          >
            {trimmedDescription}
          </Text>
        ) : null}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('published.topicLessonCount', { count: lessonCount })}
        </Text>
        <Text
          as="p"
          variant="small"
          muted
        >
          {t('published.publishedAt', { date: publishedAtLabel })}
        </Text>
      </div>
    </div>
  )
}
