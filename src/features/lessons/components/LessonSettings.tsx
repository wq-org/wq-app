import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { updateLesson, deleteLesson } from '@/features/lessons/api/lessonsApi'
import { useNavigate } from 'react-router-dom'
import { useLesson } from '@/contexts/lesson'
import { ConfirmationDialog } from '@/components/shared'
import { AlertTriangle } from 'lucide-react'
import Spinner from '@/components/ui/spinner'
import { useTranslation } from 'react-i18next'

interface LessonSettingsProps {
  lessonId: string
}

export default function LessonSettings({ lessonId }: LessonSettingsProps) {
  const navigate = useNavigate()
  const { lesson, fetchLessonById, updateLesson: updateLessonContext } = useLesson()
  const { t } = useTranslation('features.lessons')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch lesson data
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

  // Update local state when lesson changes
  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '')
      setDescription(lesson.description || '')
      setOriginalTitle(lesson.title || '')
      setOriginalDescription(lesson.description || '')
    }
  }, [lesson])

  // Check for changes
  useEffect(() => {
    const changed = title !== originalTitle || description !== originalDescription
    setHasChanges(changed)
  }, [title, description, originalTitle, originalDescription])

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
    } catch (error) {
      console.error('Error updating lesson:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLesson(lessonId)
      // Navigate back to course page (we need to get the course ID from lesson context)
      if (lesson?.topic_id) {
        // Navigate back to the course - we'd need to get course_id from topic
        // For now, navigate to dashboard
        navigate('/teacher/dashboard')
      } else {
        navigate('/teacher/dashboard')
      }
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('Failed to delete lesson. Please try again.')
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
      <div className="flex flex-col gap-6 pb-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">
            {t('settings.title', { defaultValue: 'Lesson Settings' })}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('settings.subtitle', { defaultValue: 'Manage your lesson details' })}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Title Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder={t('settings.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder={t('settings.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
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

            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('settings.deleteAction', { defaultValue: 'Delete Lesson' })}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={t('settings.deleteDialog.title')}
        description={t('settings.deleteDialog.description', {
          title:
            lesson?.title ||
            t('settings.deleteDialog.fallbackTitle', { defaultValue: 'this lesson' }),
        })}
        Icon={AlertTriangle}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmText={t('settings.deleteDialog.confirm')}
        cancelText={t('settings.deleteDialog.cancel')}
        confirmVariant="destructive"
      />
    </>
  )
}
