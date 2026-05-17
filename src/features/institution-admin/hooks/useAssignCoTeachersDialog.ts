import { useEffect, useMemo, useState } from 'react'

import { createClassroomMember } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'

export type AssignableTeacherOption = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

type UseAssignCoTeachersDialogParams = {
  classroomId: string | null
  institutionId: string | null
  /** Users that must not appear in the picker (primary teacher + existing co-teachers). */
  excludeUserIds: readonly string[]
  open: boolean
  onAssigned: () => void
}

export function useAssignCoTeachersDialog({
  classroomId,
  institutionId,
  excludeUserIds,
  open,
  onAssigned,
}: UseAssignCoTeachersDialogParams) {
  const [teachers, setTeachers] = useState<readonly AssignableTeacherOption[]>([])
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable key so a fresh array reference doesn't refire the load effect.
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
        const options: AssignableTeacherOption[] = rows
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

  const canSubmit = !!classroomId && !!institutionId && selectedIds.length > 0 && !isSubmitting

  const reset = () => {
    setSelectedIds([])
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!classroomId || !institutionId || selectedIds.length === 0) return false

    setIsSubmitting(true)
    setError(null)

    const results = await Promise.allSettled(
      selectedIds.map((userId) =>
        createClassroomMember({
          classroomId,
          institutionId,
          userId,
          role: 'co_teacher',
        }),
      ),
    )
    const failed = results.filter((r) => r.status === 'rejected')
    setIsSubmitting(false)

    if (failed.length === results.length) {
      const first = failed[0] as PromiseRejectedResult | undefined
      setError(
        first?.reason instanceof Error ? first.reason.message : 'Failed to assign co-teachers',
      )
      return false
    }
    if (failed.length > 0) setError('partial')

    onAssigned()
    reset()
    return true
  }

  return {
    teachers,
    selectedIds,
    setSelectedIds,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
  }
}
