import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquareWarning } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useCourse } from '@/contexts/course'
import { useTopic } from '@/contexts/topic'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { EmptyTopicsView } from '@/features/course/components/EmptyTopicsView'
import { TopicForm, TopicCardList } from '@/features/topic'
import TopicsToolbar from '@/features/topic/components/TopicsToolbar'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { TOPIC_SEARCH_FIELDS } from '@/features/topic/types/topic.types'
export default function Course() {
  const { t } = useTranslation('features.course')
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { selectedCourse, fetchCourseById } = useCourse()
  const { topics, loading, fetchTopicsByCourseId, createTopic } = useTopic()
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicDescription, setNewTopicDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTopics = useSearchFilter(topics, searchQuery, TOPIC_SEARCH_FIELDS)

  useEffect(() => {
    if (!courseId) return

    if (!selectedCourse || selectedCourse.id !== courseId) {
      void fetchCourseById(courseId)
    }

    void fetchTopicsByCourseId(courseId)
  }, [courseId, selectedCourse, fetchCourseById, fetchTopicsByCourseId])

  const handleCreateTopic = async () => {
    if (!courseId || !newTopicTitle.trim() || !newTopicDescription.trim()) return

    try {
      await createTopic(courseId, {
        title: newTopicTitle.trim(),
        description: newTopicDescription.trim(),
      })
      setNewTopicTitle('')
      setNewTopicDescription('')
      toast.success(t('topic.toasts.createSuccess'))
    } catch (error) {
      toast.error(t('topic.toasts.createError'))
      console.error('Failed to create topic:', error)
    }
  }

  if (!courseId) {
    return (
      <Empty className="w-full rounded-xl border border-dashed border-gray-200 p-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="border border-gray-200 bg-gray-50 text-gray-400"
          >
            <MessageSquareWarning className="h-8 w-8 text-gray-400" />
          </EmptyMedia>
          <EmptyTitle className="text-sm font-normal text-gray-500">
            {t('page.emptyState.title')}
          </EmptyTitle>
          <EmptyDescription className="text-xs text-gray-400">
            {t('page.emptyState.description')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-32">
      <TopicForm
        title={newTopicTitle}
        description={newTopicDescription}
        loading={loading}
        onTitleChange={setNewTopicTitle}
        onDescriptionChange={setNewTopicDescription}
        onCreate={handleCreateTopic}
      />

      <Text
        as="p"
        variant="h1"
        className="animate-in slide-in-from-bottom-2 text-2xl duration-300"
      >
        {t('page.topicsTitle')}
      </Text>

      <TopicsToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {loading ? (
        <div className="flex items-center justify-center py-8">
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
            themeId: selectedCourse?.theme_id,
          }))}
          onTopicView={(topicId) => navigate(`/teacher/course/${courseId}/topic/${topicId}`)}
        />
      )}
    </div>
  )
}
