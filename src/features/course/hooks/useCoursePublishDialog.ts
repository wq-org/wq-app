import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useTeacherClassrooms } from '@/features/classroom'

import { publishCourseToClassrooms } from '../api/coursePublishApi'

type UseCoursePublishDialogArgs = {
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublished?: () => void
}

export function useCoursePublishDialog({
  courseId,
  open,
  onOpenChange,
  onPublished,
}: UseCoursePublishDialogArgs) {
  const { t } = useTranslation('features.course')
  const { rows: classrooms, loading, error } = useTeacherClassrooms(open)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set())
      setPublishing(false)
    }
  }, [open])

  const selectedCount = selectedIds.size
  const allSelected = classrooms.length > 0 && selectedCount === classrooms.length
  const canConfirm = selectedCount > 0 && !publishing && !loading

  const toggleClassroom = useCallback((classroomId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(classroomId)
      else next.delete(classroomId)
      return next
    })
  }, [])

  const toggleAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedIds(new Set())
        return
      }
      setSelectedIds(new Set(classrooms.map((row) => row.id)))
    },
    [classrooms],
  )

  const handleConfirm = useCallback(async () => {
    if (!canConfirm) return

    try {
      setPublishing(true)
      const result = await publishCourseToClassrooms(courseId, [...selectedIds])
      toast.success(t('settings.toasts.publishSuccess'), {
        description: t('settings.toasts.publishSuccessDescription', {
          count: result.deliveryIds.length,
          version: result.versionNo,
        }),
      })
      onOpenChange(false)
      onPublished?.()
    } catch (e) {
      console.error('Course publish failed:', e)
      toast.error(t('settings.toasts.publishStatusFailed'))
    } finally {
      setPublishing(false)
    }
  }, [canConfirm, courseId, onOpenChange, onPublished, selectedIds, t])

  const emptyLabel = useMemo(() => {
    if (loading) return t('settings.publishDialog.loadingClassrooms')
    if (error) return t('settings.publishDialog.loadError')
    return t('settings.publishDialog.emptyClassrooms')
  }, [error, loading, t])

  return {
    classrooms,
    loading,
    error,
    selectedIds,
    selectedCount,
    allSelected,
    publishing,
    canConfirm,
    emptyLabel,
    toggleClassroom,
    toggleAll,
    handleConfirm,
  }
}
