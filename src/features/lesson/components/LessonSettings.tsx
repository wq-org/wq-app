import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import Spinner from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Text } from '@/components/ui/text'
import { TitleDescriptionFields } from '@/components/shared/forms'

export interface LessonSettingsProps {
  lessonId: string
  courseId?: string
  onUnsavedChange?: (dirty: boolean) => void
}

export function LessonSettings({ lessonId, courseId, onUnsavedChange }: LessonSettingsProps) {
  const navigate = useNavigate()
  const {
    lesson,
    fetchLessonById,
    updateLesson: updateLessonContext,
    deleteLesson: deleteLessonContext,
  } = useLesson()
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
      await updateLessonContext({ title, description }, lessonId)
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
      await deleteLessonContext(lessonId)
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
          <TitleDescriptionFields
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            titlePlaceholder={t('settings.titlePlaceholder')}
            descriptionPlaceholder={t('settings.descriptionPlaceholder')}
            titleLabel={t('settings.titleLabel')}
            descriptionLabel={t('settings.descriptionLabel')}
            maxDescriptionLength={500}
            rows={4}
          />

          <div className="flex items-center justify-end gap-4 py-4 border-t">
            <HoldToDeleteButton
              onDelete={handleDelete}
              className="gap-2"
              icon={<Trash2 className="w-4 h-4" />}
            >
              {t('settings.deleteAction', { defaultValue: 'Delete Lesson' })}
            </HoldToDeleteButton>
            <Button
              variant="darkblue"
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <>
                  <Spinner />
                  {t('settings.saving', { defaultValue: 'Saving...' })}
                </>
              ) : (
                <Check />
              )}

              {t('settings.save', { defaultValue: 'Saving...' })}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
