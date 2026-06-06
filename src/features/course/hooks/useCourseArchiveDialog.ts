import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { archiveCourseVersion, listCourseArchiveOptions } from '../api/courseVersionApi'
import type { CourseArchiveOptions } from '../types/course-version.types'

type CourseArchiveTarget = {
  type: 'version'
  id: string
}

type UseCourseArchiveDialogParams = {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onArchived?: () => void
}

const EMPTY_OPTIONS: CourseArchiveOptions = {
  versions: [],
}

export function useCourseArchiveDialog({
  courseId,
  open,
  onOpenChange,
  onArchived,
}: UseCourseArchiveDialogParams) {
  const { t } = useTranslation('features.course')
  const [options, setOptions] = useState<CourseArchiveOptions>(EMPTY_OPTIONS)
  const [selectedTarget, setSelectedTarget] = useState<CourseArchiveTarget | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOptions = useCallback(async () => {
    const trimmedCourseId = courseId.trim()
    if (!trimmedCourseId) {
      setOptions(EMPTY_OPTIONS)
      setSelectedTarget(null)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const nextOptions = await listCourseArchiveOptions(trimmedCourseId)
      setOptions(nextOptions)
      setSelectedTarget((current) => resolveSelectedTarget(current, nextOptions))
    } catch (err: unknown) {
      setOptions(EMPTY_OPTIONS)
      setSelectedTarget(null)
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    if (!open) return
    void loadOptions()
  }, [loadOptions, open])

  const handleSelectVersion = (versionId: string) => {
    setSelectedTarget({ type: 'version', id: versionId })
  }

  const handleConfirm = async () => {
    if (!selectedTarget) return

    setIsArchiving(true)

    try {
      await archiveCourseVersion(selectedTarget.id)

      toast.success(t('settings.archiveDialog.toasts.success'), {
        description: t('settings.archiveDialog.toasts.versionSuccessDescription'),
      })
      await loadOptions()
      onArchived?.()
      onOpenChange(false)
    } catch (err: unknown) {
      console.error('Error archiving course target:', err)
      toast.error(t('settings.archiveDialog.toasts.failed'))
    } finally {
      setIsArchiving(false)
    }
  }

  return {
    options,
    selectedTarget,
    isLoading,
    isArchiving,
    error,
    canConfirm: selectedTarget != null && !isArchiving,
    handleSelectVersion,
    handleConfirm,
    reload: loadOptions,
  }
}

function resolveSelectedTarget(
  current: CourseArchiveTarget | null,
  options: CourseArchiveOptions,
): CourseArchiveTarget | null {
  if (!current) return null

  return options.versions.some((version) => version.id === current.id && version.isEligible)
    ? current
    : null
}
