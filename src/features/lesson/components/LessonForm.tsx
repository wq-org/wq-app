import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useLesson } from '@/contexts/lesson'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { createYooptaStarterContentJson } from '@/features/course/utils/yooptaContent'

export interface LessonFormProps {
  topicId?: string
  courseId?: string
  onLessonCreated?: () => void
}

export default function LessonForm({ topicId, courseId, onLessonCreated }: LessonFormProps) {
  const { t } = useTranslation('features.course')
  const [newLesson, setNewLesson] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { createLesson } = useLesson()
  const bothFieldsFilled = Boolean(newLesson.trim() && description.trim() && topicId)

  const handleCreateLesson = async () => {
    if (!bothFieldsFilled || !topicId) return

    setLoading(true)
    try {
      const createdLesson = await createLesson({
        title: newLesson.trim(),
        content: createYooptaStarterContentJson(),
        description: description.trim(),
        topic_id: topicId,
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
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-lesson-title">{t('createLesson.titleLabel')}</Label>
        <Input
          id="new-lesson-title"
          value={newLesson}
          onChange={(e) => setNewLesson(e.target.value)}
          placeholder={t('createLesson.titlePlaceholder')}
          className="w-full px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex w-full flex-col">
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
          className="h-24 w-full resize-none px-5 py-3 text-base transition hover:bg-gray-100 focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-1 text-right text-xs text-gray-400">{description.length}/120</div>
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
            <Plus className="h-6 w-6 text-white" />
          )}
          <Text variant="small">{t('createLesson.button')}</Text>
        </Button>
      </div>
    </div>
  )
}
