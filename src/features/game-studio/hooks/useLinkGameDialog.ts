import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useUser } from '@/contexts/user'

import { updateGameForStudio } from '../api/gameStudioApi'
import { useTeacherPublishedCourses } from './useTeacherPublishedCourses'

type UseLinkGameDialogArgs = {
  gameId: string
  open: boolean
  linkedCourseId?: string | null
  onOpenChange: (open: boolean) => void
  onLinked?: () => void
}

export function useLinkGameDialog({
  gameId,
  open,
  linkedCourseId,
  onOpenChange,
  onLinked,
}: UseLinkGameDialogArgs) {
  const { t } = useTranslation('features.gameStudio')
  const { getUserId } = useUser()
  const teacherId = getUserId()

  const { courses, loading } = useTeacherPublishedCourses(teacherId ?? undefined, open)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    if (!open) {
      setSelectedCourseId(null)
      setLinking(false)
      return
    }

    setSelectedCourseId(linkedCourseId ?? null)
  }, [open, linkedCourseId])

  const selectCourse = useCallback((courseId: string, checked: boolean) => {
    setSelectedCourseId(checked ? courseId : null)
  }, [])

  const canConfirm =
    Boolean(selectedCourseId) && selectedCourseId !== linkedCourseId && !linking && !loading

  const handleConfirm = useCallback(async () => {
    if (!selectedCourseId || !canConfirm) return

    setLinking(true)
    try {
      await updateGameForStudio(gameId, { course_id: selectedCourseId })
      toast.success(t('linkGameDialog.toasts.linkedSuccess'))
      onOpenChange(false)
      onLinked?.()
    } catch (error) {
      console.error('[useLinkGameDialog] link failed', error)
      toast.error(t('linkGameDialog.toasts.linkedFailed'))
    } finally {
      setLinking(false)
    }
  }, [canConfirm, gameId, onLinked, onOpenChange, selectedCourseId, t])

  return {
    courses,
    loading,
    selectedCourseId,
    linking,
    canConfirm,
    selectCourse,
    handleConfirm,
  }
}
