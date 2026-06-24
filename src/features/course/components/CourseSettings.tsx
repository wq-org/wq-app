import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Archive,
  Check,
  GitCompareArrows,
  MoreHorizontal,
  Power,
  PowerOff,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { ColorPicker } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { FieldCard } from '@/components/ui/field-card'
import { FieldInput } from '@/components/ui/field-input'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import {
  getCourseById,
  restoreCourseDeliveriesOnline,
  takeCourseDeliveriesOffline,
  updateCourse,
} from '@/features/course'
import { useUser } from '@/contexts/user'
import type { ThemeId } from '@/lib/themes'

import { useCoursePublishFlow } from '../hooks/useCoursePublishFlow'
import { useCourseReleaseStatus } from '../hooks/useCourseReleaseStatus'
import { isCourseDeliveryOffline } from '../utils/courseCard.utils'
import { buildCourseReleaseReviewRoute } from '../utils/courseRelease.utils'
import { CourseArchiveDialog } from './archive/CourseArchiveDialog'
import { CourseDeleteDialog } from './CourseDeleteDialog'
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
  const [deliveryVisibilityChanging, setDeliveryVisibilityChanging] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [themeId, setThemeId] = useState<ThemeId>('blue')
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalDescription, setOriginalDescription] = useState('')
  const [originalThemeId, setOriginalThemeId] = useState<ThemeId>('blue')
  const [hasChanges, setHasChanges] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const {
    live,
    diff,
    deliveryCount,
    studentVisibleDeliveryCount,
    offlineDeliveryCount,
    loading: releaseLoading,
    refetch: refetchReleaseStatus,
  } = useCourseReleaseStatus({ courseId })

  const isDeliveryOffline = isCourseDeliveryOffline({
    studentVisibleDeliveryCount,
    offlineDeliveryCount,
  })
  const publishFlow = useCoursePublishFlow({ live, diff, isDeliveryOffline })
  const hasReleaseChanges = (diff?.summary.totalChanges ?? 0) > 0
  const showPublishBlockedOfflineHint = publishFlow.isPublishBlockedOffline && hasReleaseChanges
  const showRestoreOnlineAction = offlineDeliveryCount > 0 && studentVisibleDeliveryCount === 0

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

  const handleDeleted = () => {
    const role = profile?.role || 'teacher'
    navigate(`/${role}/dashboard`)
  }

  const handlePublished = () => {
    void refetchReleaseStatus()
  }

  const handleReviewChanges = () => {
    navigate(buildCourseReleaseReviewRoute(courseId))
  }

  const handleArchived = () => {
    void refetchReleaseStatus()
  }

  const handleTakeOffline = async () => {
    try {
      setDeliveryVisibilityChanging(true)
      const affectedCount = await takeCourseDeliveriesOffline(courseId)
      await refetchReleaseStatus()
      setMoreMenuOpen(false)
      toast.success(t('settings.toasts.offlineSuccess'), {
        description: t('settings.toasts.offlineSuccessDescription', { count: affectedCount }),
      })
    } catch (error) {
      console.error('Error taking course deliveries offline:', error)
      toast.error(t('settings.toasts.offlineFailed'))
    } finally {
      setDeliveryVisibilityChanging(false)
    }
  }

  const handleRestoreOnline = async () => {
    try {
      setDeliveryVisibilityChanging(true)
      const affectedCount = await restoreCourseDeliveriesOnline(courseId)
      await refetchReleaseStatus()
      setMoreMenuOpen(false)
      toast.success(t('settings.toasts.onlineSuccess'), {
        description: t('settings.toasts.onlineSuccessDescription', { count: affectedCount }),
      })
    } catch (error) {
      console.error('Error restoring course deliveries online:', error)
      toast.error(t('settings.toasts.onlineFailed'))
    } finally {
      setDeliveryVisibilityChanging(false)
    }
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
          offlineDeliveryCount={offlineDeliveryCount}
          loading={releaseLoading}
        />

        <CourseReleasePanel
          live={live}
          diff={diff}
          loading={releaseLoading}
        />

        <div className="flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-end">
          {showPublishBlockedOfflineHint ? (
            <Text
              as="p"
              variant="small"
              muted
              className="sm:mr-auto sm:max-w-md sm:text-left"
            >
              {t('settings.publishBlockedOfflineHint')}
            </Text>
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Popover
              open={moreMenuOpen}
              onOpenChange={setMoreMenuOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  aria-label={t('settings.moreActions')}
                >
                  <MoreHorizontal
                    className="size-4"
                    aria-hidden
                  />
                  {t('settings.moreActionsLabel')}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-60 gap-1 p-1.5"
              >
                {showRestoreOnlineAction ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 justify-start gap-2 px-2"
                    disabled={deliveryVisibilityChanging || releaseLoading}
                    onClick={() => {
                      void handleRestoreOnline()
                    }}
                  >
                    <Power
                      className="size-4"
                      aria-hidden
                    />
                    {t('settings.onlineAction')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 justify-start gap-2 px-2"
                    disabled={
                      studentVisibleDeliveryCount === 0 ||
                      deliveryVisibilityChanging ||
                      releaseLoading
                    }
                    onClick={() => {
                      void handleTakeOffline()
                    }}
                  >
                    <PowerOff
                      className="size-4"
                      aria-hidden
                    />
                    {t('settings.offlineAction')}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 justify-start gap-2 px-2"
                  disabled={releaseLoading}
                  onClick={() => {
                    setMoreMenuOpen(false)
                    setArchiveDialogOpen(true)
                  }}
                >
                  <Archive
                    className="size-4"
                    aria-hidden
                  />
                  {t('settings.archiveAction')}
                </Button>
                <div className="my-1 h-px bg-border" />
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2 px-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    setMoreMenuOpen(false)
                    setDeleteDialogOpen(true)
                  }}
                >
                  <Trash2
                    className="size-4"
                    aria-hidden
                  />
                  {t('settings.deleteAction')}
                </Button>
              </PopoverContent>
            </Popover>
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
              variant="secondary"
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
              title={
                publishFlow.isPublishBlockedOffline
                  ? t('settings.publishBlockedOfflineHint')
                  : undefined
              }
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
        isDeliveryOffline={isDeliveryOffline}
      />
      <CourseArchiveDialog
        courseId={courseId}
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onArchived={handleArchived}
      />
      <CourseDeleteDialog
        courseId={courseId}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
