import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import LessonLayout from '@/features/course/components/LessonLayout'
import LessonSettings from '@/features/course/components/LessonSettings'
import LessonEditor from '@/features/course/components/LessonEditor'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

function parseContent(raw: unknown): Record<string, unknown> | undefined {
  if (raw == null || raw === '') return undefined
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) return parsed
    } catch {
      return undefined
    }
  }
  return undefined
}

export default function Lesson() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { lesson, fetchLessonById, createLesson, updateLesson } = useLesson()
  const [editorValue, setEditorValue] = useState<Record<string, unknown> | undefined>(undefined)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (lessonId) {
      const state = location.state as {
        title?: string
        description?: string
        topicId?: string
      } | null
      if (state?.title && state?.topicId) {
        createLesson({
          title: state.title,
          content: '',
          description: state.description || '',
          topic_id: state.topicId,
        })
          .then((newLesson) => {
            if (courseId) {
              navigate(`/teacher/course/${courseId}/lesson/${newLesson.id}`, { replace: true })
            } else {
              navigate(`/teacher/lesson/${newLesson.id}`, { replace: true })
            }
          })
          .catch(console.error)
      } else {
        fetchLessonById(lessonId)
      }
    }
  }, [lessonId, courseId, location.state, fetchLessonById, createLesson, navigate])

  useEffect(() => {
    if (lesson?.content) {
      const parsed = parseContent(lesson.content)
      setEditorValue(parsed)
    }
  }, [lesson?.content])

  const handleEditorChange = useCallback(
    (newValue: Record<string, unknown>) => {
      setEditorValue(newValue)

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
      saveTimerRef.current = setTimeout(() => {
        updateLesson({ content: JSON.stringify(newValue) }).catch(console.error)
      }, 1500)
    },
    [updateLesson],
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  if (!lessonId) {
    return <div>Lesson not found</div>
  }

  const overviewContent = (
    <div className="flex flex-col gap-12 pb-32">
      <div className="max-w-6xl mt-4 flex flex-col mx-auto w-full">
        <Text
          as="h1"
          variant="h1"
          className="px-4 text-6xl font-light mb-2 leading-[1.2]"
        >
          {lesson?.title || "What's your Page about?"}
        </Text>
        <Text
          as="p"
          variant="body"
          className="px-4 text-2xl text-gray-400 font-light mt-2 max-w-[28rem]"
        >
          {lesson?.description || 'Description about the page'}
        </Text>
      </div>
      <Separator />
      <div className="flex-1 flex w-full">
        <LessonEditor
          className="w-full max-w-6xl mx-auto flex-1"
          value={editorValue}
          onChange={handleEditorChange}
          placeholder="Start writing..."
        />
      </div>
    </div>
  )

  return (
    <LessonLayout
      lessonId={lessonId}
      overviewContent={overviewContent}
      settingsContent={
        <LessonSettings
          lessonId={lessonId}
          courseId={courseId}
        />
      }
    />
  )
}
