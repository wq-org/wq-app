import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { getCourseById, updateCourse, deleteCourse } from '@/features/course'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ColorPicker } from '@/components/shared'
import type { ThemeId } from '@/lib/themes'
import { Check, Upload } from 'lucide-react'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { useDisclosure } from '@/hooks/use-disclosure'

import { CoursePublishDialog } from './CoursePublishDialog'

interface CourseSettingsProps {
  courseId: string
  onUnsavedChange?: (dirty: boolean) => void
}

export function CourseSettings({ courseId, onUnsavedChange }: CourseSettingsProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const publishDialog = useDisclosure()
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [themeId, setThemeId] = useState<ThemeId>('blue')
  const [isPublished, setIsPublished] = useState(false)
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  const [originalThemeId, setOriginalThemeId] = useState<ThemeId>('blue')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const course = await getCourseById(courseId)
        setTitle(course.title || '')
        setDescription(course.description || '')
        setThemeId(course.theme_id || 'blue')
        setIsPublished(course.is_published || false)
        setOriginalTitle(course.title || '')
        setOriginalDescription(course.description || '')
        setOriginalThemeId(course.theme_id || 'blue')
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  useEffect(() => {
    const changed =
      title !== originalTitle || description !== originalDescription || themeId !== originalThemeId
    setHasChanges(changed)
    onUnsavedChange?.(changed)
  }, [
    title,
    description,
    themeId,
    originalTitle,
    originalDescription,
    originalThemeId,
    onUnsavedChange,
  ])

  const handleSaveChanges = async () => {
    if (!hasChanges) return

    try {
      setSaving(true)
      await updateCourse(courseId, {
        title,
        description,
        theme_id: themeId,
      })
      setOriginalTitle(title)
      setOriginalDescription(description)
      setOriginalThemeId(themeId)
      setHasChanges(false)
      onUnsavedChange?.(false)
      toast.success(t('settings.toasts.saveSuccess'), {
        description: t('settings.toasts.saveSuccessDescription'),
      })
    } catch (error) {
      console.error('Error updating course:', error)
      toast.error(t('settings.toasts.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteCourse() {
    try {
      setDeleting(true)
      await deleteCourse(courseId)
      const role = profile?.role || 'teacher'
      navigate(`/${role}/dashboard`)
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error(t('settings.toasts.deleteFailed'))
      setDeleting(false)
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
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-2">
        <Text
          as="h2"
          variant="h2"
          className="text-2xl font-semibold"
        >
          {t('settings.title')}
        </Text>
        <Text
          as="p"
          variant="body"
          className="text-muted-foreground text-sm"
        >
          {t('settings.subtitle')}
        </Text>
      </div>

      <div className="flex flex-col gap-6">
        <FieldCard>
          <FieldInput
            value={title}
            onValueChange={setTitle}
            label={t('settings.titleLabel')}
            placeholder={t('settings.titlePlaceholder')}
          />
          <FieldTextarea
            value={description}
            onValueChange={setDescription}
            label={t('settings.descriptionLabel')}
            placeholder={t('settings.descriptionPlaceholder')}
            rows={4}
            maxLength={500}
          />
        </FieldCard>

        <div className="flex flex-col gap-3">
          <Label>{t('settings.themeLabel')}</Label>
          <Text
            as="p"
            variant="body"
            className="text-sm text-muted-foreground"
          >
            {t('settings.themeHint')}
          </Text>
          <ColorPicker
            selectedId={themeId}
            onSelect={setThemeId}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t py-4">
          <div className="flex items-center gap-4">
            <HoldToDeleteButton
              loading={deleting}
              onDelete={handleDeleteCourse}
            >
              {t('settings.deleteAction')}
            </HoldToDeleteButton>
            <Button
              variant="outline"
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <Spinner
                    variant="white"
                    size="sm"
                  />
                  {t('settings.saving')}
                </>
              ) : (
                <Check />
              )}
              {t('settings.save')}
            </Button>
          </div>

          {isPublished ? (
            <Text
              as="span"
              variant="small"
              className="text-muted-foreground"
            >
              {t('settings.publishedLabel')}
            </Text>
          ) : (
            <Button
              type="button"
              variant="darkblue"
              className="gap-2"
              onClick={publishDialog.onOpen}
            >
              <Upload
                className="size-4"
                aria-hidden
              />
              {t('settings.publishAction')}
            </Button>
          )}
        </div>
      </div>

      <CoursePublishDialog
        courseId={courseId}
        open={publishDialog.isOpen}
        onOpenChange={publishDialog.onToggle}
        onPublished={() => setIsPublished(true)}
      />
    </div>
  )
}
