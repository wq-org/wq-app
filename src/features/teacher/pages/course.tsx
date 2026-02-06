import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CourseLayout from '@/components/layout/CourseLayout'
import CourseSettings from '@/features/courses/components/CourseSettings'
import { useCourse } from '@/contexts/course'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { EmptyTopicsView } from '@/features/courses/components/EmptyTopicsView'
import { TopicBadge, type Topic } from '@/features/courses/components/TopicBadge'
import { CreateLessonForm } from '@/features/lessons/components/CreateLessonForm'
import { LessonCardList } from '@/features/lessons/components/LessonCardList'
import { EmptyLessonsView } from '@/features/lessons/components/EmptyLessonsView'
import type { Lesson } from '@/features/lessons/types/lesson.types'
import { getLessonsByTopicId } from '@/features/lessons/api/lessonsApi'
import { createTopic, deleteTopic, getTopicsByCourseId } from '@/features/courses/api/coursesApi'
import { Text } from '@/components/ui/text'
export default function Course() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchCourseById, selectedCourse } = useCourse()
  const [newTopic, setNewTopic] = useState('')
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(false)

  // Fetch and store course in context when component mounts or id changes
  useEffect(() => {
    if (id) {
      // Only fetch if we don't already have this course selected
      if (!selectedCourse || selectedCourse.id !== id) {
        fetchCourseById(id)
      }
    }
  }, [id, fetchCourseById, selectedCourse])

  // Fetch topics for the course when component mounts or id changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (id) {
        try {
          const fetchedTopics = await getTopicsByCourseId(id)
          setTopics(fetchedTopics)
        } catch (error) {
          console.error('Failed to fetch topics:', error)
          // TODO: Show error toast/notification
        }
      }
    }

    fetchTopics()
  }, [id])

  // Fetch lessons when a topic is selected
  useEffect(() => {
    const fetchLessons = async () => {
      if (selectedTopic?.id) {
        setLessonsLoading(true)
        try {
          const fetchedLessons = await getLessonsByTopicId(selectedTopic.id)
          setLessons(fetchedLessons)
        } catch (error) {
          console.error('Failed to fetch lessons:', error)
          // TODO: Show error toast/notification
        } finally {
          setLessonsLoading(false)
        }
      } else {
        // Clear lessons when no topic is selected
        setLessons([])
      }
    }

    fetchLessons()
  }, [selectedTopic?.id])

  const addTopic = async () => {
    if (!newTopic.trim() || !id) return

    setLoading(true)
    try {
      const createdTopic = await createTopic(id, newTopic.trim())
      const topic: Topic = {
        id: createdTopic.id,
        name: createdTopic.name,
      }
      setTopics((prev) => [...prev, topic])
      setNewTopic('')
    } catch (error) {
      console.error('Failed to create topic:', error)
      // TODO: Show error toast/notification
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
      // TODO: Show error toast/notification
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTopic()
    }
  }

  if (!id) {
    return <div>Course not found</div>
  }

  const overviewContent = (
    <div className="flex flex-col gap-6 pb-32">
      <div className="flex items-center gap-4">
        <Input
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Neues Thema hinzufügen"
          className="flex-1   px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-300"
        />
        <Button
          variant="default"
          size="icon"
          onClick={addTopic}
          disabled={loading || !newTopic.trim()}
          className="rounded-full font-semibold hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-50 duration-300"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      <Text as="p" variant="body" className="animate-in fade-in slide-in-from-bottom-2 duration-300 text-2xl">Themen</Text>

      {/* Empty state when no topics */}
      {topics.length === 0 ? (
        <EmptyTopicsView />
      ) : (
        /* Topics list */
        <div className="flex flex-wrap gap-4">
          {topics.map((topic, index) => (
            <TopicBadge
              key={topic.id}
              topic={topic}
              isSelected={selectedTopic?.id === topic.id}
              index={index}
              onToggle={toggleTopic}
              onDelete={onDeleteTopic}
            />
          ))}
        </div>
      )}

      {/* Lessons Container - Only shows when a topic is selected */}
      {selectedTopic && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6">
            <Text as="h2" variant="h2" className="text-2xl font-semibold text-gray-900">
              Lessons for: {selectedTopic.name}
            </Text>
            <Text as="p" variant="body" className="text-gray-500 mt-1">Explore the available lessons for this topic</Text>
          </div>

          <div className="mb-6">
            <CreateLessonForm
              topicId={selectedTopic.id}
              onLessonCreated={async () => {
                // Refresh lessons list after creating a lesson
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
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : lessons.length === 0 ? (
            <EmptyLessonsView />
          ) : (
            <LessonCardList
              lessons={lessons}
              onView={(lessonId) => {
                navigate(`/teacher/lesson/${lessonId}`)
              }}
            />
          )}
        </div>
      )}
    </div>
  )

  return (
    <CourseLayout
      overviewContent={overviewContent}
      settingsContent={<CourseSettings courseId={id} />}
    />
  )
}