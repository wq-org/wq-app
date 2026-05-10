import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MessageSquareWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { dismissSaveStatusToast, showSaveStatusToast } from '@/components/shared'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useCourse } from '@/contexts/course'
import { useLesson } from '@/contexts/lesson'
import { useTopic } from '@/contexts/topic'
import { LessonCardList, LessonForm, LessonFilter } from '@/features/lesson'
import { TopicLayout } from '@/features/topic'
import { TopicPreviewTab } from '@/features/topic'
import { TopicSettings } from '@/features/topic'
import type { TopicTabId } from '@/features/topic'
import { useSearchFilter } from '@/hooks/useSearchFilter'
import { LESSON_SEARCH_FIELDS } from '@/features/lesson'
import { Separator } from '@/components/ui/separator'

const TOPIC_LESSONS_ERROR_TOAST_ID = 'topic-lessons-list-error'

const Topic = () => {
  const { t } = useTranslation('features.course')
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TopicTabId>('editor')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const { selectedCourse, fetchCourseById } = useCourse()
  const { selectedTopic, fetchTopicById, loading: topicLoading, error: topicError } = useTopic()
  const { lessons, fetchLessonsByTopicId, listLoading: lessonLoading, error: lessonError } = useLesson()

  /** Header columns only; lesson body is loaded separately via `lesson_blocks` on the lesson route. */
  const filteredLessons = useSearchFilter(lessons, searchQuery, LESSON_SEARCH_FIELDS)

  useEffect(() => {
    if (lessonError) {
      showSaveStatusToast({
        id: TOPIC_LESSONS_ERROR_TOAST_ID,
        tone: 'error',
        title: t('page.notFound'),
        description: lessonError,
      })
    } else {
      dismissSaveStatusToast(TOPIC_LESSONS_ERROR_TOAST_ID)
    }
    return () => {
      dismissSaveStatusToast(TOPIC_LESSONS_ERROR_TOAST_ID)
    }
  }, [lessonError, t])

  useEffect(() => {
    if (courseId && (!selectedCourse || selectedCourse.id !== courseId)) {
      void fetchCourseById(courseId)
    }
  }, [courseId, selectedCourse, fetchCourseById])

  useEffect(() => {
    if (!topicId) return

    let cancelled = false
    setLoadError(null)

    const loadTopic = async () => {
      try {
        const topic = await fetchTopicById(topicId)
        if (!topic || cancelled) return

        if (courseId && topic.course_id !== courseId) {
          return
        }

        await fetchLessonsByTopicId(topic.id)
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : t('page.emptyState.description')
          setLoadError(message)
          console.error('Failed to load topic:', error)
        }
      }
    }

    void loadTopic()

    return () => {
      cancelled = true
    }
  }, [topicId, courseId, fetchTopicById, fetchLessonsByTopicId, t])

  if (!courseId || !topicId) {
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
            {t('page.notFound')}
          </EmptyTitle>
          <EmptyDescription className="text-xs text-gray-400">
            {t('page.emptyState.description')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (topicLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner
          variant="gray"
          size="md"
        />
      </div>
    )
  }

  if (!selectedTopic || selectedTopic.course_id !== courseId || topicError || loadError) {
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
            {t('page.notFound')}
          </EmptyTitle>
          <EmptyDescription className="text-xs text-gray-400">
            {loadError || topicError || t('page.emptyState.description')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <TopicLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'editor' ? (
        <div className="flex flex-col gap-6 pb-32">
          <div className="space-y-1">
            <div className="flex gap-2">
              <Text
                color={selectedCourse?.theme_id}
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
                {selectedTopic.title}
              </Text>
            </div>
            <Text
              as="p"
              variant="body"
              className="text-gray-500"
            >
              {selectedTopic.description?.trim() || t('page.lessonsForTopicDescription')}
            </Text>
          </div>

          <Separator />

          <div className="mb-2">
            <LessonForm
              topicId={selectedTopic.id}
              courseId={courseId}
            />
          </div>

          <Text
            as="p"
            variant="h3"
          >
            {t('page.lessonsTitle')}
          </Text>

          <LessonFilter
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {lessonLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner
                variant="gray"
                size="sm"
              />
            </div>
          ) : (
            <LessonCardList
              lessons={filteredLessons}
              themeId={selectedCourse?.theme_id}
              onLessonOpen={(lessonId) => {
                navigate(`/teacher/course/${courseId}/lesson/${lessonId}`, {
                  state: { initialTab: 'editor' },
                })
              }}
            />
          )}
        </div>
      ) : null}

      {activeTab === 'preview' ? (
        <TopicPreviewTab
          title={selectedTopic.title}
          description={selectedTopic.description?.trim() || t('page.lessonsForTopicDescription')}
          lessons={lessons}
          themeId={selectedCourse?.theme_id}
          onLessonOpen={(lessonId) => {
            navigate(`/teacher/course/${courseId}/lesson/${lessonId}`, {
              state: { initialTab: 'preview' },
            })
          }}
        />
      ) : null}

      {activeTab === 'settings' ? <TopicSettings topicId={selectedTopic.id} /> : null}

  
    </TopicLayout>
  )
}

export { Topic }
