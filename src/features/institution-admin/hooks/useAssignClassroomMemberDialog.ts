import { useEffect, useMemo, useState } from 'react'

import { createClassroomMember } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'
import type { InstitutionDirectoryRow } from '../types/institution-users.types'

type MemberOption = {
  id: string
  label: string
  role: 'teacher' | 'student'
}

type UseAssignClassroomMemberDialogParams = {
  classroomId: string | null
  institutionId: string | null
  open: boolean
  onAssigned: () => void
}

export function useAssignClassroomMemberDialog({
  classroomId,
  institutionId,
  open,
  onAssigned,
}: UseAssignClassroomMemberDialogParams) {
  const [users, setUsers] = useState<readonly MemberOption[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !institutionId) {
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const rows = await fetchInstitutionUserDirectory(institutionId)
        if (cancelled) return
        setUsers(toMemberOptions(rows))
      } catch (loadError) {
        if (!cancelled) {
          setUsers([])
          setError(loadError instanceof Error ? loadError.message : 'Failed to load users')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [institutionId, open])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  )

  const canSubmit = !!classroomId && !!institutionId && !!selectedUserId && !isSubmitting

  const reset = () => {
    setSelectedUserId('')
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!classroomId || !institutionId || !selectedUser) {
      return false
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await createClassroomMember({
        classroomId,
        institutionId,
        userId: selectedUser.id,
        role: selectedUser.role === 'teacher' ? 'co_teacher' : 'student',
      })
      onAssigned()
      reset()
      return true
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to assign user')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    users,
    selectedUserId,
    setSelectedUserId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
  }
}

function toMemberOptions(rows: readonly InstitutionDirectoryRow[]): readonly MemberOption[] {
  return rows
    .filter((row) => row.rowKind === 'member')
    .filter((row) => row.membership_status === 'active')
    .filter((row) => row.membership_role === 'teacher' || row.membership_role === 'student')
    .map((row) => ({
      id: row.user_id,
      label: row.display_name?.trim() || row.username?.trim() || row.email?.trim() || row.user_id,
      role: row.membership_role === 'teacher' ? 'teacher' : 'student',
    }))
}
