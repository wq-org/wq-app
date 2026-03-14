import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { getCourseById, updateCourse, deleteCourse } from '@/features/course'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ColorPicker } from '@/components/shared'
import type { ThemeId } from '@/lib/themes'
import { Check } from 'lucide-react'
import { TitleDescriptionFields } from '@/components/shared/forms'

interface CourseSettingsProps {
  courseId: string
  onUnsavedChange?: (dirty: boolean) => void
}

export function CourseSettings({ courseId, onUnsavedChange }: CourseSettingsProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
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

  const handleTogglePublished = async (checked: boolean) => {
    try {
      setIsPublishing(true)

      await updateCourse(courseId, {
        is_published: checked,
      })
      setIsPublished(checked)
      toast.success(t('settings.toasts.saveSuccess'), {
        description: t('settings.toasts.saveSuccessDescription'),
      })
    } catch (error) {
      setIsPublishing(false)
      console.error('Error updating publish status:', error)
      setIsPublished(!checked)
      toast.error(t('settings.toasts.publishStatusFailed'))
    } finally {
      setIsPublishing(false)
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
        <TitleDescriptionFields
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          titleLabel={t('settings.titleLabel')}
          descriptionLabel={t('settings.descriptionLabel')}
          titlePlaceholder={t('settings.titlePlaceholder')}
          descriptionPlaceholder={t('settings.descriptionPlaceholder')}
          rows={4}
          maxDescriptionLength={500}
        />

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

        <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="published"
              className="text-base font-medium"
            >
              {t('settings.publishedLabel')}
            </Label>
            <Text
              as="p"
              variant="body"
              className="text-sm text-muted-foreground"
            >
              {t('settings.publishedHint')}
            </Text>
          </div>
          {isPublishing ? (
            <Spinner size="xs" />
          ) : (
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={handleTogglePublished}
            />
          )}
        </div>

        <div className="flex  items-center justify-end gap-4 py-4 border-t">
          <HoldToDeleteButton
            loading={deleting}
            onDelete={handleDeleteCourse}
          >
            {t('settings.deleteAction')}
          </HoldToDeleteButton>
          <Button
            variant="darkblue"
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
      </div>
    </div>
  )
}
