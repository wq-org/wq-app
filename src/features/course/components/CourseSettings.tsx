import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, GitCompareArrows, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { ColorPicker } from '@/components/shared'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { deleteCourse, getCourseById, updateCourse } from '@/features/course'
import { useUser } from '@/contexts/user'
import type { ThemeId } from '@/lib/themes'

import { useCoursePublishFlow } from '../hooks/useCoursePublishFlow'
import { useCourseReleaseStatus } from '../hooks/useCourseReleaseStatus'
import { buildCourseReleaseReviewRoute } from '../utils/courseRelease.utils'
import { CourseLiveSnapshotCard } from './release/CourseLiveSnapshotCard'
import { CoursePublishFlowDialogs } from './release/CoursePublishFlowDialogs'
import { CourseReleasePanel } from './release/CourseReleasePanel'

type CourseSettingsProps = {
  courseId: string
  onUnsavedChange?: (dirty: boolean) => void
}

export function CourseSettings({ courseId, onUnsavedChange }: CourseSettingsProps) {
  const { t } = useTranslation('features.course')
  const navigate = useNavigate()
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [themeId, setThemeId] = useState<ThemeId>('blue')
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  const [originalThemeId, setOriginalThemeId] = useState<ThemeId>('blue')
  const [hasChanges, setHasChanges] = useState(false)

  const {
    live,
    diff,
    deliveryCount,
    loading: releaseLoading,
    refetch: refetchReleaseStatus,
  } = useCourseReleaseStatus({ courseId })

  const publishFlow = useCoursePublishFlow({ live, diff })
  const hasReleaseChanges = (diff?.summary.totalChanges ?? 0) > 0

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const course = await getCourseById(courseId)
        setTitle(course.title || '')
        setDescription(course.description || '')
        setThemeId(course.theme_id || 'blue')
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
      void fetchCourse()
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
      await refetchReleaseStatus()
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

  const handlePublished = () => {
    void refetchReleaseStatus()
  }

  const handleReviewChanges = () => {
    navigate(buildCourseReleaseReviewRoute(courseId))
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner
          variant="gray"
          size="lg"
          speed={1750}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
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

        <CourseLiveSnapshotCard
          live={live}
          deliveryCount={deliveryCount}
          loading={releaseLoading}
        />

        <CourseReleasePanel
          live={live}
          diff={diff}
          loading={releaseLoading}
        />

        <div className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <HoldToDeleteButton
            loading={deleting}
            onDelete={handleDeleteCourse}
          >
            {t('settings.deleteAction')}
          </HoldToDeleteButton>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={!hasReleaseChanges || releaseLoading}
              onClick={handleReviewChanges}
            >
              <GitCompareArrows
                className="size-4"
                aria-hidden
              />
              {t('settings.releasePanel.reviewChanges')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <Spinner
                  variant="white"
                  size="sm"
                />
              ) : (
                <Check className="size-4" />
              )}
              {saving ? t('settings.saving') : t('settings.save')}
            </Button>
            <Button
              type="button"
              variant="darkblue"
              className="gap-2"
              disabled={!publishFlow.canPublishUpdate || releaseLoading}
              onClick={publishFlow.handlePublishUpdate}
            >
              <Upload
                className="size-4"
                aria-hidden
              />
              {publishFlow.publishButtonLabel}
            </Button>
          </div>
        </div>
      </div>

      <CoursePublishFlowDialogs
        courseId={courseId}
        onPublished={handlePublished}
        flow={publishFlow}
      />
    </div>
  )
}
