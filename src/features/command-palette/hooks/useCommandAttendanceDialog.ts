import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  closeAttendanceSession,
  createAttendanceSession,
  listClassroomsForAttendance,
  listCoursesLinkedToClassroom,
  listOpenAttendanceSessionsForClassroom,
} from '@/features/attendance'
import type {
  AttendanceClassroomOption,
  AttendanceCourseOption,
  AttendanceOpenSession,
} from '@/features/attendance'

export type CommandAttendanceMode = 'start' | 'end'

type UseCommandAttendanceDialogOptions = {
  mode: CommandAttendanceMode
  open: boolean
  onRequestClose: () => void
}

export function useCommandAttendanceDialog({
  mode,
  open,
  onRequestClose,
}: UseCommandAttendanceDialogOptions) {
  const { t } = useTranslation('features.commandPalette')
  const [classrooms, setClassrooms] = useState<readonly AttendanceClassroomOption[]>([])
  const [courses, setCourses] = useState<readonly AttendanceCourseOption[]>([])
  const [sessions, setSessions] = useState<readonly AttendanceOpenSession[]>([])
  const [selectedClassroomId, setSelectedClassroomId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [title, setTitle] = useState('')
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [startsAt, setStartsAt] = useState(() => {
    const d = new Date()
    d.setMinutes(0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [endsAt, setEndsAt] = useState('')
  const [closeEndsAt, setCloseEndsAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    void listClassroomsForAttendance()
      .then((list) => {
        if (!cancelled) setClassrooms(list)
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : t('attendanceDialog.loadClassroomsFailed'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, t])

  useEffect(() => {
    if (!open || !selectedClassroomId) {
      setCourses([])
      setSelectedCourseId('')
      setSessions([])
      setSelectedSessionId('')
      return
    }
    let cancelled = false
    if (mode === 'start') {
      void listCoursesLinkedToClassroom(selectedClassroomId)
        .then((list) => {
          if (!cancelled) {
            setCourses(list)
            setSelectedCourseId((previous) => {
              if (previous && list.some((c) => c.id === previous)) return previous
              return list[0]?.id ?? ''
            })
          }
        })
        .catch(() => {
          if (!cancelled) setCourses([])
        })
    } else {
      void listOpenAttendanceSessionsForClassroom(selectedClassroomId)
        .then((list) => {
          if (!cancelled) {
            setSessions(list)
            setSelectedSessionId((previous) => {
              if (previous && list.some((s) => s.id === previous)) return previous
              return list[0]?.id ?? ''
            })
          }
        })
        .catch(() => {
          if (!cancelled) setSessions([])
        })
    }
    return () => {
      cancelled = true
    }
  }, [open, mode, selectedClassroomId])

  const reset = useCallback(() => {
    setSelectedClassroomId('')
    setSelectedCourseId('')
    setSelectedSessionId('')
    setTitle('')
    setError(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      if (mode === 'start') {
        if (!selectedClassroomId || !selectedCourseId) {
          setError(t('attendanceDialog.errors.classroomAndCourseRequired'))
          return
        }
        const startsIso = new Date(startsAt).toISOString()
        const endsIso = endsAt.trim() ? new Date(endsAt).toISOString() : null
        await createAttendanceSession({
          classroomId: selectedClassroomId,
          courseId: selectedCourseId,
          title: title.trim() || null,
          sessionDate,
          startsAt: startsIso,
          endsAt: endsIso,
        })
        toast.success(t('attendanceDialog.toastStarted'))
      } else {
        if (!selectedSessionId) {
          setError(t('attendanceDialog.errors.sessionRequired'))
          return
        }
        await closeAttendanceSession(selectedSessionId, new Date(closeEndsAt).toISOString())
        toast.success(t('attendanceDialog.toastClosed'))
      }
      reset()
      onRequestClose()
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t('attendanceDialog.errors.requestFailed'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    mode,
    selectedClassroomId,
    selectedCourseId,
    selectedSessionId,
    title,
    sessionDate,
    startsAt,
    endsAt,
    closeEndsAt,
    reset,
    onRequestClose,
    t,
  ])

  const canSubmitStart =
    mode === 'start' &&
    Boolean(selectedClassroomId) &&
    Boolean(selectedCourseId) &&
    Boolean(sessionDate) &&
    Boolean(startsAt)

  const canSubmitEnd = mode === 'end' && Boolean(selectedClassroomId) && Boolean(selectedSessionId)

  return {
    classrooms,
    courses,
    sessions,
    selectedClassroomId,
    setSelectedClassroomId,
    selectedCourseId,
    setSelectedCourseId,
    selectedSessionId,
    setSelectedSessionId,
    title,
    setTitle,
    sessionDate,
    setSessionDate,
    startsAt,
    setStartsAt,
    endsAt,
    setEndsAt,
    closeEndsAt,
    setCloseEndsAt,
    isLoading,
    isSubmitting,
    error,
    handleSubmit,
    canSubmit: mode === 'start' ? canSubmitStart : canSubmitEnd,
  }
}
