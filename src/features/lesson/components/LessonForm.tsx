import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useLesson } from '@/contexts/lesson'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { createYooptaStarterContentJson } from '@/features/course'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
export interface LessonFormProps {
  topicId?: string
  courseId?: string
  onLessonCreated?: () => void
}

export function LessonForm({ topicId, courseId, onLessonCreated }: LessonFormProps) {
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
        <FieldCard>
          <FieldInput
            value={newLesson}
            onValueChange={setNewLesson}
            label={t('createLesson.titleLabel')}
            placeholder={t('createLesson.titlePlaceholder')}
          />
          <FieldTextarea
            value={description}
            onValueChange={(nextDescription) => {
              if (nextDescription.length <= 120) {
                setDescription(nextDescription)
              }
            }}
            label={t('createLesson.descriptionLabel')}
            placeholder={t('createLesson.descriptionPlaceholder')}
            maxLength={120}
            rows={3}
          />
        </FieldCard>
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
