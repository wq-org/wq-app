import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { LessonFilter } from '@/features/lesson'
import { TopicCardList } from '@/features/topic'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import type { ThemeId } from '@/lib/themes'

import type { PublishedCourseTopic } from '../../types/course-version.types'
import { mapPublishedTopicToCardProps } from '../../utils/courseVersion.utils'

const TOPIC_SEARCH_FIELDS = ['title', 'description'] as const

type PublishedCourseTopicListProps = {
  topics: readonly PublishedCourseTopic[]
  themeId?: ThemeId
  onTopicView: (topicId: string) => void
}

export function PublishedCourseTopicList({
  topics,
  themeId,
  onTopicView,
}: PublishedCourseTopicListProps) {
  const { t } = useTranslation('features.course')
  const [searchQuery, setSearchQuery] = useState('')
  const filteredTopics = useSearchFilter(topics, searchQuery, TOPIC_SEARCH_FIELDS)

  const topicCards = useMemo(
    () => filteredTopics.map((topic) => mapPublishedTopicToCardProps(topic, themeId)),
    [filteredTopics, themeId],
  )

  if (topics.length === 0) {
    return (
      <Text
        as="p"
        variant="body"
        muted
      >
        {t('published.emptyTree')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-32">
      <Text
        as="p"
        variant="body"
        className="animate-in fade-in slide-in-from-bottom-2 text-2xl duration-300"
      >
        {t('page.topicsTitle')}
      </Text>

      <LessonFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {topicCards.length === 0 ? (
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('published.noSearchMatches')}
        </Text>
      ) : (
        <TopicCardList
          topics={topicCards}
          onTopicView={onTopicView}
        />
      )}
    </div>
  )
}
