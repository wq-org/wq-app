import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { LessonFilter } from '@/features/lesson'
import { TopicCardList } from '@/features/topic'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import type { ThemeId } from '@/lib/themes'

import type { PublishedCourseTopic } from '../../types/course-version.types'
import { mapPublishedTopicToCardProps } from '../../utils/courseVersion.utils'
import { PublishedCourseGamesSection } from './PublishedCourseGamesSection'

const TOPIC_SEARCH_FIELDS = ['title', 'description'] as const

type PublishedCourseTopicListProps = {
  courseId: string
  courseTitle: string
  courseDescription?: string
  topics: readonly PublishedCourseTopic[]
  themeId?: ThemeId
  onTopicView: (topicId: string) => void
  onGameOpen: (gameId: string) => void
}

export function PublishedCourseTopicList({
  courseId,
  courseTitle,
  courseDescription,
  topics,
  themeId,
  onTopicView,
  onGameOpen,
}: PublishedCourseTopicListProps) {
  const { t } = useTranslation('features.course')
  const [searchQuery, setSearchQuery] = useState('')
  const filteredTopics = useSearchFilter(topics, searchQuery, TOPIC_SEARCH_FIELDS)
  const trimmedDescription = courseDescription?.trim()

  const topicCards = useMemo(
    () => filteredTopics.map((topic) => mapPublishedTopicToCardProps(topic, themeId)),
    [filteredTopics, themeId],
  )

  const courseHeader = (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2">
        <Text
          color={themeId}
          as="h1"
          variant="h1"
          className="text-2xl font-semibold"
        >
          {t('page.courseLabel')}
        </Text>
        <Text
          as="h1"
          variant="h1"
          className="text-2xl font-semibold"
        >
          {courseTitle}
        </Text>
      </div>
      {trimmedDescription ? (
        <Text
          as="p"
          variant="body"
          className="text-muted-foreground"
        >
          {trimmedDescription}
        </Text>
      ) : null}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 pb-32">
      {courseHeader}

      <PublishedCourseGamesSection
        courseId={courseId}
        onGameOpen={onGameOpen}
      />

      {topics.length === 0 ? (
        <Text
          as="p"
          variant="body"
          muted
        >
          {t('published.emptyTree')}
        </Text>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
