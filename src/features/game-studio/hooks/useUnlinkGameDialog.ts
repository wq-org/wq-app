import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getCourseById, type Course } from '@/features/course'

import { getGameLinkedCourseIds, unlinkGameFromCourse } from '../api/gameStudioApi'

type UseUnlinkGameDialogArgs = {
  gameId: string
  open: boolean
  linkedCourseIds?: string[]
  onOpenChange: (open: boolean) => void
  onUnlinked?: () => void
}

export function useUnlinkGameDialog({
  gameId,
  open,
  linkedCourseIds = [],
  onOpenChange,
  onUnlinked,
}: UseUnlinkGameDialogArgs) {
  const { t } = useTranslation('features.gameStudio')
  const [linkedCourses, setLinkedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [unlinking, setUnlinking] = useState(false)

  useEffect(() => {
    if (!open) {
      setLinkedCourses([])
      setSelectedCourseIds([])
      setUnlinking(false)
      setLoading(false)
      return
    }

    setLoading(true)

    const resolveIds =
      linkedCourseIds.length > 0 ? Promise.resolve(linkedCourseIds) : getGameLinkedCourseIds(gameId)

    resolveIds
      .then((ids) => {
        if (ids.length === 0) {
          setLinkedCourses([])
          setSelectedCourseIds([])
          setLoading(false)
          return
        }
        return Promise.all(ids.map((id) => getCourseById(id).catch(() => null))).then((results) => {
          const courses = results.filter((c): c is Course => c !== null)
          setLinkedCourses(courses)
          setLoading(false)
        })
      })
      .catch((error) => {
        console.error('[useUnlinkGameDialog] load linked courses failed', error)
        setLinkedCourses([])
        setLoading(false)
        toast.error(t('unlinkGameDialog.toasts.loadFailed'))
      })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const courses = useMemo(() => linkedCourses, [linkedCourses])

  const selectCourse = useCallback((courseId: string, checked: boolean) => {
    setSelectedCourseIds((prev) =>
      checked
        ? prev.includes(courseId)
          ? prev
          : [...prev, courseId]
        : prev.filter((id) => id !== courseId),
    )
  }, [])

  const canConfirm = selectedCourseIds.length > 0 && !unlinking && !loading

  const handleConfirm = useCallback(async () => {
    if (selectedCourseIds.length === 0 || !canConfirm) return

    setUnlinking(true)
    try {
      await Promise.all(selectedCourseIds.map((courseId) => unlinkGameFromCourse(gameId, courseId)))
      toast.success(t('unlinkGameDialog.toasts.unlinkedSuccess'))
      onOpenChange(false)
      onUnlinked?.()
    } catch (error) {
      console.error('[useUnlinkGameDialog] unlink failed', error)
      toast.error(t('unlinkGameDialog.toasts.unlinkedFailed'))
    } finally {
      setUnlinking(false)
    }
  }, [canConfirm, gameId, onOpenChange, onUnlinked, selectedCourseIds, t])

  return {
    courses,
    loading,
    selectedCourseIds,
    unlinking,
    canConfirm,
    selectCourse,
    handleConfirm,
  }
}
