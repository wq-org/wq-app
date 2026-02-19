import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { updateLesson, deleteLesson } from '@/features/course/api/lessonsApi'
import { useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import Spinner from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Text } from '@/components/ui/text'

export interface LessonSettingsProps {
  lessonId: string
  courseId?: string
  onUnsavedChange?: (dirty: boolean) => void
}

export default function LessonSettings({
  lessonId,
  courseId,
  onUnsavedChange,
}: LessonSettingsProps) {
  const navigate = useNavigate()
  const { lesson, fetchLessonById, updateLesson: updateLessonContext } = useLesson()
  const { t } = useTranslation('features.lesson')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true)
        await fetchLessonById(lessonId)
      } catch (error) {
        console.error('Error fetching lesson:', error)
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId, fetchLessonById])

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '')
      setDescription(lesson.description || '')
      setOriginalTitle(lesson.title || '')
      setOriginalDescription(lesson.description || '')
    }
  }, [lesson])

  useEffect(() => {
    const changed = title !== originalTitle || description !== originalDescription
    setHasChanges(changed)
    onUnsavedChange?.(changed)
  }, [title, description, originalTitle, originalDescription, onUnsavedChange])

  const handleSaveChanges = async () => {
    if (!hasChanges) return

    try {
      setSaving(true)
      await updateLesson(lessonId, {
        title,
        description,
      })
      await updateLessonContext({ title, description })
      setOriginalTitle(title)
      setOriginalDescription(description)
      setHasChanges(false)
      toast.success(t('settings.toasts.saveSuccess'), {
        description: t('settings.toasts.saveSuccessDescription'),
      })
    } catch (error) {
      console.error('Error updating lesson:', error)
      toast.error(t('settings.toasts.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLesson(lessonId)
      if (courseId) {
        navigate(`/teacher/course/${courseId}`)
      } else {
        navigate('/teacher/dashboard')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert(t('settings.errors.deleteFailed'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner
          variant="gray"
          size="lg"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-12 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex flex-col gap-2">
          <Text
            as="h2"
            variant="h2"
            className="text-2xl font-semibold"
          >
            {t('settings.title', { defaultValue: 'Lesson Settings' })}
          </Text>
          <Text
            as="p"
            variant="body"
            className="text-muted-foreground text-sm"
          >
            {t('settings.subtitle', { defaultValue: 'Manage your lesson details' })}
          </Text>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">{t('settings.titleLabel')}</Label>
            <Input
              id="title"
              type="text"
              placeholder={t('settings.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">{t('settings.descriptionLabel')}</Label>
            <Textarea
              id="description"
              placeholder={t('settings.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-end gap-4 py-4 border-t">
            <Button
              variant="default"
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('settings.saving', { defaultValue: 'Saving...' })}
                </>
              ) : (
                t('settings.save', { defaultValue: 'Save Changes' })
              )}
            </Button>

            <HoldToDeleteButton
              onDelete={handleDelete}
              className="gap-2"
              icon={<Trash2 className="w-4 h-4" />}
            >
              {t('settings.deleteAction', { defaultValue: 'Delete Lesson' })}
            </HoldToDeleteButton>
          </div>
        </div>
      </div>
    </>
  )
}
