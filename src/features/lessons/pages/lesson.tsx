import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import LessonLayout from '@/components/layout/LessonLayout'
import LessonSettings from '@/features/lessons/components/LessonSettings'
import LessonEditor from '@/features/lessons/components/LessonEditor'
import { LessonCardList } from '@/features/lessons/components/LessonCardList'
import { getLessonsByTopicId, deleteLesson } from '@/features/lessons/api/lessonsApi'
import type { Lesson } from '@/features/lessons/types/lesson.types'
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
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { lesson, fetchLessonById, createLesson, updateLesson } = useLesson()
  const [editorValue, setEditorValue] = useState<Record<string, unknown> | undefined>(undefined)
  const [topicLessons, setTopicLessons] = useState<Lesson[]>([])
  const [topicLessonsLoading, setTopicLessonsLoading] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (id) {
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
            navigate(`/teacher/lesson/${newLesson.id}`, { replace: true })
          })
          .catch(console.error)
      } else {
        fetchLessonById(id)
      }
    }
  }, [id, location.state, fetchLessonById, createLesson, navigate])

  useEffect(() => {
    if (lesson?.content) {
      const parsed = parseContent(lesson.content)
      setEditorValue(parsed)
    }
  }, [lesson?.content])

  useEffect(() => {
    if (!lesson?.topic_id) {
      setTopicLessons([])
      return
    }
    setTopicLessonsLoading(true)
    getLessonsByTopicId(lesson.topic_id)
      .then(setTopicLessons)
      .catch(console.error)
      .finally(() => setTopicLessonsLoading(false))
  }, [lesson?.topic_id])

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

  if (!id) {
    return <div>Lesson not found</div>
  }

  const overviewContent = (
    <div className="flex flex-col gap-12 pb-32">
      <div className="max-w-4xl mt-4 flex flex-col mx-auto">
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
          className="w-full max-w-4xl mx-auto flex-1"
          value={editorValue}
          onChange={handleEditorChange}
          placeholder="Start writing..."
        />
      </div>
      <Separator className="max-w-4xl mx-auto w-full" />
      <div className="max-w-4xl mx-auto w-full">
        <Text
          as="h2"
          variant="h2"
          className="text-xl font-semibold mb-4"
        >
          Lessons in this topic
        </Text>
        {!lesson?.topic_id ? (
          <p className="text-sm text-muted-foreground">
            Assign a topic in Settings to see other lessons in this topic.
          </p>
        ) : topicLessonsLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <LessonCardList
            lessons={topicLessons}
            onView={(lessonId) => navigate(`/teacher/lesson/${lessonId}`)}
            onDelete={async (lessonId) => {
              try {
                await deleteLesson(lessonId)
                if (lessonId === id) {
                  navigate(-1)
                } else {
                  if (lesson?.topic_id) {
                    const list = await getLessonsByTopicId(lesson.topic_id)
                    setTopicLessons(list)
                  }
                }
              } catch (e) {
                console.error(e)
              }
            }}
          />
        )}
      </div>
    </div>
  )

  return (
    <LessonLayout
      lessonId={id}
      overviewContent={overviewContent}
      settingsContent={<LessonSettings lessonId={id} />}
    />
  )
}
