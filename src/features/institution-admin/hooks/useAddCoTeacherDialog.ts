import { useEffect, useMemo, useState } from 'react'

import { createClassroomMember } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'

export type CoTeacherOption = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

type UseAddCoTeacherDialogParams = {
  classroomId: string | null
  institutionId: string | null
  /** User ids that must not appear in the picker (primary teacher + existing co-teachers). */
  excludeUserIds: readonly string[]
  open: boolean
  onAdded: () => void
}

export function useAddCoTeacherDialog({
  classroomId,
  institutionId,
  excludeUserIds,
  open,
  onAdded,
}: UseAddCoTeacherDialogParams) {
  const [teachers, setTeachers] = useState<readonly CoTeacherOption[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable string key for the excluded set so the effect doesn't re-run on
  // every render just because the parent passed a fresh array reference.
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
        const options: CoTeacherOption[] = rows
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

  const canSubmit = !!classroomId && !!institutionId && !!selectedTeacherId && !isSubmitting

  const reset = () => {
    setSelectedTeacherId('')
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!classroomId || !institutionId || !selectedTeacher) return false

    setIsSubmitting(true)
    setError(null)
    try {
      await createClassroomMember({
        classroomId,
        institutionId,
        userId: selectedTeacher.id,
        role: 'co_teacher',
      })
      onAdded()
      reset()
      return true
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to add co-teacher')
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
