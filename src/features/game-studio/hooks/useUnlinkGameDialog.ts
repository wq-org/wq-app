import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getCourseById, type Course } from '@/features/course'

import { updateGameForStudio } from '../api/gameStudioApi'

type UseUnlinkGameDialogArgs = {
  gameId: string
  open: boolean
  linkedCourseId?: string | null
  onOpenChange: (open: boolean) => void
  onUnlinked?: () => void
}

export function useUnlinkGameDialog({
  gameId,
  open,
  linkedCourseId,
  onOpenChange,
  onUnlinked,
}: UseUnlinkGameDialogArgs) {
  const { t } = useTranslation('features.gameStudio')
  const [linkedCourse, setLinkedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [unlinking, setUnlinking] = useState(false)

  useEffect(() => {
    if (!open) {
      setLinkedCourse(null)
      setSelectedCourseId(null)
      setUnlinking(false)
      setLoading(false)
      return
    }

    if (!linkedCourseId) {
      setLinkedCourse(null)
      setSelectedCourseId(null)
      return
    }

    setSelectedCourseId(linkedCourseId)
    setLoading(true)

    getCourseById(linkedCourseId)
      .then((course) => {
        setLinkedCourse(course)
      })
      .catch((error) => {
        console.error('[useUnlinkGameDialog] load linked course failed', error)
        setLinkedCourse(null)
        toast.error(t('unlinkGameDialog.toasts.loadFailed'))
      })
      .finally(() => {
        setLoading(false)
      })
  }, [linkedCourseId, open, t])

  const courses = useMemo(() => (linkedCourse ? [linkedCourse] : []), [linkedCourse])

  const selectCourse = useCallback((courseId: string, checked: boolean) => {
    setSelectedCourseId(checked ? courseId : null)
  }, [])

  const canConfirm = Boolean(selectedCourseId) && !unlinking && !loading

  const handleConfirm = useCallback(async () => {
    if (!selectedCourseId || !canConfirm) return

    setUnlinking(true)
    try {
      await updateGameForStudio(gameId, { course_id: null })
      toast.success(t('unlinkGameDialog.toasts.unlinkedSuccess'))
      onOpenChange(false)
      onUnlinked?.()
    } catch (error) {
      console.error('[useUnlinkGameDialog] unlink failed', error)
      toast.error(t('unlinkGameDialog.toasts.unlinkedFailed'))
    } finally {
      setUnlinking(false)
    }
  }, [canConfirm, gameId, onOpenChange, onUnlinked, selectedCourseId, t])

  return {
    courses,
    loading,
    selectedCourseId,
    unlinking,
    canConfirm,
    selectCourse,
    handleConfirm,
  }
}
