import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourse } from '@/contexts/course'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquareWarning } from 'lucide-react'
import { EmptyTopicsView } from '@/features/course/components/EmptyTopicsView'
import { TopicBadge } from '@/features/course/components/TopicBadge'
import { CreateLessonForm } from '@/features/course/components/CreateLessonForm'
import { CourseLessonTable } from '@/features/course/components/CourseLessonTable'
import { EmptyLessonsView } from '@/features/course/components/EmptyLessonsView'
import type { Lesson } from '@/features/course/types/lesson.types'
import { getLessonsByTopicId, deleteLesson } from '@/features/course/api/lessonsApi'
import { createTopic, deleteTopic, getTopicsByCourseId } from '@/features/course/api/coursesApi'
import { Text } from '@/components/ui/text'
import Spinner from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'
import type { HoldDeleteTooltipProps, Topic } from '../types/topics.types'
import { Textarea } from '@/components/ui/textarea'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { toast } from 'sonner'

export default function Course() {
  const { t } = useTranslation('features.course')
  const { t: tGameStudio } = useTranslation('features.gameStudio')

  const holdDeleteTooltip: HoldDeleteTooltipProps = {
    tooltipDelayDuration: 500,
    tooltipTitle: tGameStudio('holdDelete.title'),
    tooltipDescription: tGameStudio('holdDelete.description'),
    tooltipHoldMessage: (seconds: number) => tGameStudio('holdDelete.holdMessage', { seconds }),
    tooltipDeletingIn: (seconds: number) => tGameStudio('holdDelete.deletingIn', { seconds }),
    tooltipDeleting: tGameStudio('holdDelete.deleting'),
    holdDuration: 3000,
  }
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { fetchCourseById, selectedCourse } = useCourse()
  const [newTopic, setNewTopic] = useState('')
  const [newTopicDescription, setNewTopicDescription] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicsLoading, setTopicsLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(false)

  useEffect(() => {
    if (courseId) {
      if (!selectedCourse || selectedCourse.id !== courseId) {
        fetchCourseById(courseId)
      }
    }
  }, [courseId, fetchCourseById, selectedCourse])

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

  const addTopic = async () => {
    if (!newTopic.trim() || !courseId) return

    setLoading(true)
    try {
      const createdTopic = await createTopic(courseId, newTopic.trim(), newTopicDescription)
      const topic: Topic = {
        id: createdTopic.id,
        name: createdTopic.name,
        description: createdTopic.description,
      }
      setTopics((prev) => [...prev, topic])
      setNewTopic('')
      setNewTopicDescription('')
      toast.success(t('topic.toasts.createSuccess'))
    } catch (error) {
      toast.error(t('topic.toasts.createError'))
      console.error('Failed to create topic:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topic: Topic) => {
    setSelectedTopic(selectedTopic?.id === topic.id ? null : topic)
  }

  const onDeleteTopic = async (topicToDelete: Topic) => {
    try {
      await deleteTopic(topicToDelete.id)
      setTopics((prev) => prev.filter((t) => t.id !== topicToDelete.id))
      if (selectedTopic?.id === topicToDelete.id) {
        setSelectedTopic(null)
      }
    } catch (error) {
      console.error('Failed to delete topic:', error)
    }
  }

  if (!courseId) {
    return (
      <Empty className="w-full animate-in fade-in-0 slide-in-from-bottom-5 duration-300 border border-dashed border-gray-200 rounded-xl p-6">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="bg-gray-50 border border-gray-200 text-gray-400"
          >
            <MessageSquareWarning className="w-8 h-8 text-gray-400" />
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
      <div className="flex flex-col  gap-4">
        <div className="flex flex-col w-full gap-2">
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder={t('page.addTopicPlaceholder')}
            className="flex-1   px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-300"
          />
          <Textarea
            value={newTopicDescription}
            onChange={(e) => setNewTopicDescription(e.target.value)}
            placeholder={t('page.addTopicDescriptionPlaceholder')}
            className="flex-1   px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-300"
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="default"
            className="self-start"
            onClick={addTopic}
            disabled={loading || !newTopic.trim() || !newTopicDescription.trim()}
          >
            {loading ? (
              <Spinner
                variant="white"
                size="sm"
              />
            ) : (
              <Plus className="w-6 h-6 text-white" />
            )}
            <Text variant="small">{t('topic.button')}</Text>
          </Button>
        </div>
      </div>

      <Text
        as="p"
        variant="body"
        className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-2xl"
      >
        {t('page.topicsTitle')}
      </Text>

      {topicsLoading ? (
        <div className="flex items-center justify-center py-8">
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
              onDelete={onDeleteTopic}
              holdDeleteTooltip={holdDeleteTooltip}
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
              {!selectedTopic?.description?.trim()
                ? t('page.lessonsForTopicDescription')
                : selectedTopic.description}
            </Text>
          </div>

          <div className="mb-6">
            <CreateLessonForm
              topicId={selectedTopic.id}
              courseId={courseId}
              onLessonCreated={async () => {
                if (selectedTopic?.id) {
                  try {
                    const fetchedLessons = await getLessonsByTopicId(selectedTopic.id)
                    setLessons(fetchedLessons)
                  } catch (error) {
                    console.error('Failed to refresh lessons:', error)
                  }
                }
              }}
            />
          </div>

          {lessonsLoading ? (
            <div className="flex items-center justify-center py-12">
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
                  state: { initialTab: 'overview' },
                })
              }}
              onDelete={async (lessonId) => {
                try {
                  await deleteLesson(lessonId)
                  if (selectedTopic?.id) {
                    const list = await getLessonsByTopicId(selectedTopic.id)
                    setLessons(list)
                  }
                } catch (e) {
                  console.error(e)
                }
              }}
              holdDeleteTooltip={holdDeleteTooltip}
            />
          )}
        </div>
      )}
    </div>
  )
}
