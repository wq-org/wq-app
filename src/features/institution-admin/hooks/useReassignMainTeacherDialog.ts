import { useEffect, useMemo, useState } from 'react'

import { updateClassroom } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'

export type TeacherOption = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

type UseReassignMainTeacherDialogParams = {
  classroomId: string | null
  institutionId: string | null
  /**
   * User ids that must not appear in the picker — typically the current main
   * teacher (no-op reassignment) plus active co-teachers of the same classroom
   * (cannot dual-role). Computed in the parent via `getMainTeacherExclusions`.
   */
  excludeUserIds: readonly string[]
  open: boolean
  onReassigned: () => void
}

export function useReassignMainTeacherDialog({
  classroomId,
  institutionId,
  excludeUserIds,
  open,
  onReassigned,
}: UseReassignMainTeacherDialogParams) {
  const [teachers, setTeachers] = useState<readonly TeacherOption[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable string key so a fresh array reference from the parent doesn't refire the effect.
  const excludeKey = useMemo(() => [...excludeUserIds].sort().join('|'), [excludeUserIds])

  useEffect(() => {
    if (!open || !institutionId) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const rows = await fetchInstitutionUserDirectory(institutionId)
        if (cancelled) return
        const excluded = new Set(excludeKey ? excludeKey.split('|') : [])
        const options: TeacherOption[] = rows
          .filter((row) => row.rowKind === 'member')
          .filter((row) => row.membership_status === 'active')
          .filter((row) => row.membership_role === 'teacher')
          .filter((row) => !excluded.has(row.user_id))
          .map((row) => ({
            id: row.user_id,
            name:
              row.display_name?.trim() || row.username?.trim() || row.email?.trim() || row.user_id,
            email: row.email?.trim() ?? '',
            avatarUrl: row.avatar_url ?? null,
          }))
        setTeachers(options)
      } catch (loadError) {
        if (!cancelled) {
          setTeachers([])
          setError(loadError instanceof Error ? loadError.message : 'Failed to load teachers')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [institutionId, open, excludeKey])

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === selectedTeacherId) ?? null,
    [selectedTeacherId, teachers],
  )

  const canSubmit = !!classroomId && !!selectedTeacherId && !isSubmitting

  const reset = () => {
    setSelectedTeacherId('')
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!classroomId || !selectedTeacher) return false

    setIsSubmitting(true)
    setError(null)
    try {
      await updateClassroom({ classroomId, primaryTeacherId: selectedTeacher.id })
      onReassigned()
      reset()
      return true
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to reassign main teacher',
      )
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    teachers,
    selectedTeacherId,
    setSelectedTeacherId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
  }
}
