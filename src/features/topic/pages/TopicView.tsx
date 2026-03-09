import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppWrapper } from '@/components/layout'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { getCourseById } from '@/features/course'
import { getLessonsByTopicId, type Lesson } from '@/features/lesson'
import { TopicPreviewTab } from '@/features/topic'
import { getTopicById } from '@/features/topic'
import type { Topic } from '@/features/topic'
import type { Course } from '@/features/course'

export default function TopicView() {
  const { t } = useTranslation('features.course')
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [topic, setTopic] = useState<Topic | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!courseId || !topicId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const [fetchedCourse, fetchedTopic, fetchedLessons] = await Promise.all([
          getCourseById(courseId),
          getTopicById(topicId),
          getLessonsByTopicId(topicId),
        ])

        if (cancelled) return

        if (!fetchedTopic || fetchedTopic.course_id !== courseId) {
          setCourse(null)
          setTopic(null)
          setLessons([])
        } else {
          setCourse(fetchedCourse)
          setTopic(fetchedTopic)
          setLessons(fetchedLessons)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load student topic view:', error)
          setCourse(null)
          setTopic(null)
          setLessons([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [courseId, topicId])

  return (
    <AppWrapper role="student">
      <div className="mx-auto flex w-full flex-col gap-6 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner
              variant="gray"
              size="lg"
              speed={1750}
            />
          </div>
        ) : !course || !topic || !courseId ? (
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground"
          >
            {t('page.notFound')}
          </Text>
        ) : (
          <TopicPreviewTab
            title={topic.title}
            description={topic.description}
            lessons={lessons}
            themeId={course.theme_id}
            onLessonOpen={(lessonId) => navigate(`/student/course/${courseId}/lesson/${lessonId}`)}
          />
        )}
      </div>
    </AppWrapper>
  )
}
