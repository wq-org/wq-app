import { useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import LessonLayout from '@/components/layout/LessonLayout'
import LessonSettings from '@/features/lessons/components/LessonSettings'
import { Separator } from '@/components/ui/separator'

export default function Lesson() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { lesson, fetchLessonById, createLesson } = useLesson()

  // Initialize lesson on mount
  useEffect(() => {
    if (id) {
      // Check if this is a new lesson (from location state)
      const state = location.state as {
        title?: string
        description?: string
        topicId?: string
      } | null
      if (state?.title && state?.topicId) {
        // Create new lesson
        createLesson({
          title: state.title,
          content: '',
          description: state.description || '',
          topic_id: state.topicId,
        })
          .then((newLesson) => {
            // Navigate to the new lesson's ID
            navigate(`/teacher/lesson/${newLesson.id}`, { replace: true })
          })
          .catch(console.error)
      } else {
        // Fetch existing lesson
        fetchLessonById(id)
      }
    }
  }, [id, location.state, fetchLessonById, createLesson, navigate])

  if (!id) {
    return <div>Lesson not found</div>
  }

  const overviewContent = (
    <div className="flex flex-col gap-12 pb-32">
      <div className="max-w-4xl mt-4 flex flex-col mx-auto">
        <h1 className="px-4 text-6xl font-light mb-2 leading-[1.2]">
          {lesson?.title || "What's your Page about?"}
        </h1>
        <p className="px-4 text-2xl text-gray-400 font-light mt-2 max-w-[28rem]">
          {lesson?.description || 'Description about the page'}
        </p>
      </div>
      <Separator />
      <div className="flex-1 flex w-full">
        {/* <YooptaEditor
                    className="w-full max-w-4xl mx-auto flex-1"
                    editor={editor}
                    plugins={plugins}
                    value={value}
                    autoFocus={true}
                    onChange={(newValue) => setValue(newValue)}
                    placeholder="Start writing..."
                /> */}
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
