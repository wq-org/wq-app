import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { useLesson } from '@/contexts/lesson'
import { Textarea } from '@/components/ui/textarea'
import { Text } from '@/components/ui/text'
import Spinner from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createYooptaStarterContentJson } from '@/features/course/utils/yooptaContent'

export interface CreateLessonFormProps {
  topicId?: string
  courseId?: string
  onLessonCreated?: () => void
}

export function CreateLessonForm({ topicId, courseId, onLessonCreated }: CreateLessonFormProps) {
  const { t } = useTranslation('features.course')
  const [newLesson, setNewLesson] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { createLesson } = useLesson()

  const bothFieldsFilled = !!newLesson.trim() && !!description.trim() && !!topicId

  const handleCreateLesson = async () => {
    if (!bothFieldsFilled) return

    setLoading(true)
    try {
      const createdLesson = await createLesson({
        title: newLesson.trim(),
        content: createYooptaStarterContentJson(),
        description: description.trim(),
        topic_id: topicId as string,
      })

      if (courseId) {
        navigate(`/teacher/course/${courseId}/lesson/${createdLesson.id}`)
      } else {
        navigate(`/teacher/lesson/${createdLesson.id}`)
      }
      toast.success(t('createLesson.toasts.success'))
      setNewLesson('')
      setDescription('')
      onLessonCreated?.()
    } catch (error) {
      toast.error(t('createLesson.toasts.error'))
      console.error('Failed to create lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-lesson-title">{t('createLesson.titleLabel')}</Label>
        <Input
          id="new-lesson-title"
          value={newLesson}
          onChange={(e) => setNewLesson(e.target.value)}
          placeholder={t('createLesson.titlePlaceholder')}
          className="w-full px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 animate-in fade-in slide-in-from-bottom-3 duration-300"
        />
      </div>
      <div className="flex flex-col w-full">
        <Label
          htmlFor="new-lesson-description"
          className="mb-2"
        >
          {t('createLesson.descriptionLabel')}
        </Label>
        <Textarea
          id="new-lesson-description"
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= 120) {
              setDescription(e.target.value)
            }
          }}
          maxLength={120}
          placeholder={t('createLesson.descriptionPlaceholder')}
          className="w-full px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20 resize-none h-24"
        />
        <div className="text-right text-xs text-gray-400 mt-1">{description.length}/120</div>
      </div>
      <div className="flex justify-end">
        <Button
          variant="darkblue"
          onClick={handleCreateLesson}
          disabled={loading || !bothFieldsFilled}
        >
          {loading ? (
            <Spinner
              size="sm"
              variant="white"
            />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
          <Text variant="small">{t('createLesson.button')}</Text>
        </Button>
      </div>
    </div>
  )
}
