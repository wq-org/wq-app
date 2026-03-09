import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { EmptyTopicsView } from '@/features/course'
import type { Topic } from '@/features/topic'
import type { ThemeId } from '@/lib/themes'
import { LessonToolBar } from '@/features/lesson'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { getTopicsByCourseId, TOPIC_SEARCH_FIELDS } from '@/features/topic'
export interface CoursePreviewTabProps {
  courseId: string
  themeId?: ThemeId
  onTopicView?: (topicId: string) => void
}

export function CoursePreviewTab({ courseId, themeId, onTopicView }: CoursePreviewTabProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const [topics, setTopics] = useState<Topic[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [topicsLoading, setTopicsLoading] = useState(true)
  const filteredTopics = useSearchFilter(topics, searchQuery, TOPIC_SEARCH_FIELDS)

  useEffect(() => {
    const fetchTopics = async () => {
      if (!courseId) {
        setTopicsLoading(false)
        return
      }

      setTopicsLoading(true)
      try {
        const fetchedTopics = await getTopicsByCourseId(courseId)
        setTopics(fetchedTopics)
      } catch (error) {
        console.error('Failed to fetch topics:', error)
      } finally {
        setTopicsLoading(false)
      }
    }

    void fetchTopics()
  }, [courseId])

  return (
    <div className="flex flex-col gap-6 pb-32">
      <Text
        as="p"
        variant="body"
        className="animate-in fade-in slide-in-from-bottom-2 text-2xl duration-300"
      >
        {t('page.topicsTitle')}
      </Text>

      <LessonToolBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {topicsLoading ? (
        <div className="flex justify-center py-8">
          <Spinner
            variant="gray"
            size="md"
          />
        </div>
      ) : filteredTopics.length === 0 ? (
        <EmptyTopicsView />
      ) : (
        <TopicCardList
          topics={filteredTopics.map((topic) => ({
            id: topic.id,
            title: topic.title,
            description: topic.description,
            themeId,
          }))}
          onTopicView={(topicId) => {
            if (onTopicView) {
              onTopicView(topicId)
              return
            }

            navigate(`/teacher/course/${courseId}/topic/${topicId}`)
          }}
        />
      )}
    </div>
  )
}
