import { useEffect, useMemo, useState } from 'react'

import { createClassroomMember } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'

export type AssignableStudentOption = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

type UseAssignStudentsDialogParams = {
  classroomId: string | null
  institutionId: string | null
  /** Users already assigned as students to this classroom (do not re-offer). */
  excludeUserIds: readonly string[]
  open: boolean
  onAssigned: () => void
}

export function useAssignStudentsDialog({
  classroomId,
  institutionId,
  excludeUserIds,
  open,
  onAssigned,
}: UseAssignStudentsDialogParams) {
  const [students, setStudents] = useState<readonly AssignableStudentOption[]>([])
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const options: AssignableStudentOption[] = rows
          .filter((row) => row.rowKind === 'member')
          .filter((row) => row.membership_status === 'active')
          .filter((row) => row.membership_role === 'student')
          .filter((row) => !excluded.has(row.user_id))
          .map((row) => ({
            id: row.user_id,
            name:
              row.display_name?.trim() || row.username?.trim() || row.email?.trim() || row.user_id,
            email: row.email?.trim() ?? '',
            avatarUrl: row.avatar_url ?? null,
          }))
        setStudents(options)
      } catch (loadError) {
        if (!cancelled) {
          setStudents([])
          setError(loadError instanceof Error ? loadError.message : 'Failed to load students')
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
          role: 'student',
        }),
      ),
    )
    const failed = results.filter((r) => r.status === 'rejected')
    setIsSubmitting(false)

    if (failed.length === results.length) {
      const first = failed[0] as PromiseRejectedResult | undefined
      setError(first?.reason instanceof Error ? first.reason.message : 'Failed to assign students')
      return false
    }
    if (failed.length > 0) setError('partial')

    onAssigned()
    reset()
    return true
  }

  return {
    students,
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
