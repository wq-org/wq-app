import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EmptyTopicsView } from '@/features/course/components/EmptyTopicsView'
import { TopicBadge, type Topic } from '@/features/course/components/TopicBadge'
import { CourseLessonTable } from '@/features/course/components/CourseLessonTable'
import { EmptyLessonsView } from '@/features/course/components/EmptyLessonsView'
import type { Lesson } from '@/features/course/types/lesson.types'
import { getLessonsByTopicId } from '@/features/course/api/lessonsApi'
import { getTopicsByCourseId } from '@/features/course/api/coursesApi'
import { Text } from '@/components/ui/text'
import Spinner from '@/components/ui/spinner'

export interface CoursePreviewTabProps {
  courseId: string
}

export default function CoursePreviewTab({ courseId }: CoursePreviewTabProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(false)

  useEffect(() => {
    const fetchTopics = async () => {
      if (courseId) {
        setTopicsLoading(true)
        try {
          const fetchedTopics = await getTopicsByCourseId(courseId)
          setTopics(fetchedTopics)
        } catch (error) {
          console.error('Failed to fetch topics:', error)
        } finally {
          setTopicsLoading(false)
        }
      } else {
        setTopicsLoading(false)
      }
    }

    fetchTopics()
  }, [courseId])

  useEffect(() => {
    const fetchLessons = async () => {
      if (selectedTopic?.id) {
        setLessonsLoading(true)
        try {
          const fetchedLessons = await getLessonsByTopicId(selectedTopic.id)
          setLessons(fetchedLessons)
        } catch (error) {
          console.error('Failed to fetch lessons:', error)
        } finally {
          setLessonsLoading(false)
        }
      } else {
        setLessons([])
      }
    }

    fetchLessons()
  }, [selectedTopic?.id])

  const toggleTopic = (topic: Topic) => {
    setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)
  }

  return (
    <div className="flex flex-col gap-6 pb-32">
      <Text
        as="p"
        variant="body"
        className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-2xl"
      >
        {t('page.topicsTitle')}
      </Text>

      {topicsLoading ? (
        <div className="flex justify-center py-8">
          <Spinner
            variant="gray"
            size="md"
          />
        </div>
      ) : topics.length === 0 ? (
        <EmptyTopicsView />
      ) : (
        <div className="flex flex-wrap gap-4">
          {topics.map((topic, index) => (
            <TopicBadge
              key={topic.id}
              topic={topic}
              isSelected={selectedTopic?.id === topic.id}
              index={index}
              onToggle={toggleTopic}
            />
          ))}
        </div>
      )}

      {selectedTopic && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6">
            <Text
              as="h2"
              variant="h2"
              className="text-2xl font-semibold text-gray-900"
            >
              {t('page.lessonsForTopic', { topic: selectedTopic.name })}
            </Text>
            <Text
              as="p"
              variant="body"
              className="text-gray-500 mt-1"
            >
              {t('page.lessonsForTopicDescription')}
            </Text>
          </div>

          {lessonsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner
                variant="gray"
                size="sm"
              />
            </div>
          ) : lessons.length === 0 ? (
            <EmptyLessonsView />
          ) : (
            <CourseLessonTable
              lessons={lessons}
              onView={(lessonId) => {
                navigate(`/teacher/course/${courseId}/lesson/${lessonId}`, {
                  state: { initialTab: 'preview' },
                })
              }}
              showDeleteAction={false}
            />
          )}
        </div>
      )}
    </div>
  )
}
