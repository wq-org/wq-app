import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getLessonById } from '@/features/course/api/lessonsApi'
import { getTopicById } from '@/features/course/api/coursesApi'
import Spinner from '@/components/ui/spinner'

/**
 * Redirects legacy /teacher/lesson/:id to /teacher/course/:courseId/lesson/:id
 * by resolving courseId from the lesson's topic.
 */
export default function LessonRedirect() {
  const { id: lessonId } = useParams<{ id: string }>()
  const [target, setTarget] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!lessonId) {
      setError(true)
      return
    }

    let cancelled = false
    const id = lessonId

    async function resolve() {
      try {
        const lesson = await getLessonById(id)
        const topic = await getTopicById(lesson.topic_id)
        if (!cancelled && topic) {
          setTarget(`/teacher/course/${topic.course_id}/lesson/${id}`)
        } else {
          setError(true)
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }

    resolve()
    return () => {
      cancelled = true
    }
  }, [lessonId])

  if (error) {
    return <Navigate to="/teacher/dashboard" replace />
  }

  if (target) {
    return <Navigate to={target} replace />
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner variant="gray" size="lg" />
    </div>
  )
}
