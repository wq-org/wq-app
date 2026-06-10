import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { useUser } from '@/contexts/user'

import { COURSE_NOT_LIVE_FOR_GAME_LINK, linkGameToCourse } from '../api/gameStudioApi'
import { useTeacherPublishedCourses } from './useTeacherPublishedCourses'

type UseLinkGameDialogArgs = {
  gameId: string
  open: boolean
  linkedCourseIds?: string[]
  onOpenChange: (open: boolean) => void
  onLinked?: () => void
}

export function useLinkGameDialog({
  gameId,
  open,
  linkedCourseIds = [],
  onOpenChange,
  onLinked,
}: UseLinkGameDialogArgs) {
  const { t } = useTranslation('features.gameStudio')
  const { getUserId } = useUser()
  const teacherId = getUserId()

  const { courses, loading } = useTeacherPublishedCourses(teacherId ?? undefined, open)
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    if (!open) {
      setSelectedCourseIds([])
      setLinking(false)
      return
    }
    setSelectedCourseIds([...linkedCourseIds])
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectCourse = useCallback((courseId: string, checked: boolean) => {
    setSelectedCourseIds((prev) =>
      checked
        ? prev.includes(courseId)
          ? prev
          : [...prev, courseId]
        : prev.filter((id) => id !== courseId),
    )
  }, [])

  const newlySelected = selectedCourseIds.filter((id) => !linkedCourseIds.includes(id))
  const canConfirm = newlySelected.length > 0 && !linking && !loading

  const handleConfirm = useCallback(async () => {
    if (newlySelected.length === 0 || !canConfirm) return

    setLinking(true)
    try {
      await Promise.all(newlySelected.map((courseId) => linkGameToCourse(gameId, courseId)))
      toast.success(t('linkGameDialog.toasts.linkedSuccess'))
      onOpenChange(false)
      onLinked?.()
    } catch (error) {
      console.error('[useLinkGameDialog] link failed', error)
      const message = error instanceof Error ? error.message : ''
      toast.error(
        message === COURSE_NOT_LIVE_FOR_GAME_LINK
          ? t('linkGameDialog.toasts.courseNotLive')
          : t('linkGameDialog.toasts.linkedFailed'),
      )
    } finally {
      setLinking(false)
    }
  }, [canConfirm, gameId, newlySelected, onLinked, onOpenChange, t])

  return {
    courses,
    loading,
    selectedCourseIds,
    linking,
    canConfirm,
    selectCourse,
    handleConfirm,
  }
}
