import { useEffect, useMemo, useState } from 'react'

import { createClassroomMember, updateClassroom } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'
import type { ClassroomMember } from '../types/classroom.types'
import type { InstitutionDirectoryRow } from '../types/institution-users.types'

export type AssignableUserOption = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  alreadyAssigned: boolean
}

type UseAssignClassroomMemberDialogParams = {
  classroomId: string | null
  institutionId: string | null
  members: readonly ClassroomMember[]
  primaryTeacherId: string | null
  open: boolean
  onAssigned: () => void
}

export function useAssignClassroomMemberDialog({
  classroomId,
  institutionId,
  members,
  primaryTeacherId,
  open,
  onAssigned,
}: UseAssignClassroomMemberDialogParams) {
  const [directory, setDirectory] = useState<readonly InstitutionDirectoryRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignedCoTeacherIds = useMemo(() => {
    const ids = new Set<string>()
    for (const member of members) {
      if (member.role === 'co_teacher') ids.add(member.userId)
    }
    return ids
  }, [members])

  const assignedStudentIds = useMemo(() => {
    const ids = new Set<string>()
    for (const member of members) {
      if (member.role === 'student') ids.add(member.userId)
    }
    return ids
  }, [members])

  const teacherOptions = useMemo<readonly AssignableUserOption[]>(() => {
    return directory
      .filter((row) => row.rowKind === 'member')
      .filter((row) => row.membership_status === 'active')
      .filter((row) => row.membership_role === 'teacher')
      .map((row) => ({
        id: row.user_id,
        name: row.display_name?.trim() || row.username?.trim() || row.email?.trim() || row.user_id,
        email: row.email?.trim() ?? '',
        avatarUrl: row.avatar_url ?? null,
        alreadyAssigned: assignedCoTeacherIds.has(row.user_id),
      }))
  }, [directory, assignedCoTeacherIds])

  const mainTeacherOptions = useMemo<readonly AssignableUserOption[]>(() => {
    if (primaryTeacherId) return []
    return directory
      .filter((row) => row.rowKind === 'member')
      .filter((row) => row.membership_status === 'active')
      .filter((row) => row.membership_role === 'teacher')
      .map((row) => ({
        id: row.user_id,
        name: row.display_name?.trim() || row.username?.trim() || row.email?.trim() || row.user_id,
        email: row.email?.trim() ?? '',
        avatarUrl: row.avatar_url ?? null,
        alreadyAssigned: false,
      }))
  }, [directory, primaryTeacherId])

  const studentOptions = useMemo<readonly AssignableUserOption[]>(() => {
    return directory
      .filter((row) => row.rowKind === 'member')
      .filter((row) => row.membership_status === 'active')
      .filter((row) => row.membership_role === 'student')
      .map((row) => ({
        id: row.user_id,
        name: row.display_name?.trim() || row.username?.trim() || row.email?.trim() || row.user_id,
        email: row.email?.trim() ?? '',
        avatarUrl: row.avatar_url ?? null,
        alreadyAssigned: assignedStudentIds.has(row.user_id),
      }))
  }, [directory, assignedStudentIds])

  const initialCoTeacherSelection = useMemo(
    () => teacherOptions.filter((option) => option.alreadyAssigned).map((option) => option.id),
    [teacherOptions],
  )
  const initialStudentSelection = useMemo(
    () => studentOptions.filter((option) => option.alreadyAssigned).map((option) => option.id),
    [studentOptions],
  )

  const [selectedPrimaryTeacherId, setSelectedPrimaryTeacherId] = useState('')
  const [selectedCoTeacherIds, setSelectedCoTeacherIds] = useState<readonly string[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<readonly string[]>([])

  useEffect(() => {
    if (open) {
      setSelectedCoTeacherIds(initialCoTeacherSelection)
      setSelectedStudentIds(initialStudentSelection)
      setSelectedPrimaryTeacherId('')
    }
  }, [initialCoTeacherSelection, initialStudentSelection, open])

  useEffect(() => {
    if (!selectedPrimaryTeacherId) return
    setSelectedCoTeacherIds((previous) => previous.filter((id) => id !== selectedPrimaryTeacherId))
  }, [selectedPrimaryTeacherId])

  useEffect(() => {
    if (!open || !institutionId) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const rows = await fetchInstitutionUserDirectory(institutionId)
        if (!cancelled) setDirectory(rows)
      } catch (loadError) {
        if (!cancelled) {
          setDirectory([])
          setError(loadError instanceof Error ? loadError.message : 'Failed to load users')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [institutionId, open])

  const newCoTeacherIds = useMemo(
    () =>
      selectedCoTeacherIds.filter(
        (id) => !assignedCoTeacherIds.has(id) && id !== selectedPrimaryTeacherId,
      ),
    [selectedCoTeacherIds, assignedCoTeacherIds, selectedPrimaryTeacherId],
  )
  const newStudentIds = useMemo(
    () => selectedStudentIds.filter((id) => !assignedStudentIds.has(id)),
    [selectedStudentIds, assignedStudentIds],
  )

  const newPrimaryTeacher =
    !primaryTeacherId && selectedPrimaryTeacherId.trim() !== '' ? selectedPrimaryTeacherId : null

  const canSubmit =
    !!classroomId &&
    !!institutionId &&
    !isSubmitting &&
    (newPrimaryTeacher !== null || newCoTeacherIds.length > 0 || newStudentIds.length > 0)

  const reset = () => {
    setSelectedCoTeacherIds(initialCoTeacherSelection)
    setSelectedStudentIds(initialStudentSelection)
    setSelectedPrimaryTeacherId('')
    setError(null)
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!classroomId || !institutionId) return false
    if (newPrimaryTeacher === null && newCoTeacherIds.length === 0 && newStudentIds.length === 0) {
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (newPrimaryTeacher !== null) {
        await updateClassroom({
          classroomId,
          primaryTeacherId: newPrimaryTeacher,
        })
      }
    } catch (primaryErr) {
      setIsSubmitting(false)
      setError(primaryErr instanceof Error ? primaryErr.message : 'Failed to assign main teacher')
      return false
    }

    const tasks: Promise<unknown>[] = []

    for (const userId of newCoTeacherIds) {
      tasks.push(
        createClassroomMember({
          classroomId,
          institutionId,
          userId,
          role: 'co_teacher',
        }),
      )
    }
    for (const userId of newStudentIds) {
      tasks.push(
        createClassroomMember({
          classroomId,
          institutionId,
          userId,
          role: 'student',
        }),
      )
    }

    const results = await Promise.allSettled(tasks)
    const failed = results.filter((result) => result.status === 'rejected')

    setIsSubmitting(false)

    if (failed.length === results.length) {
      const first = failed[0] as PromiseRejectedResult | undefined
      const reason = first?.reason
      setError(reason instanceof Error ? reason.message : 'Failed to assign users')
      return false
    }

    if (failed.length > 0) {
      setError('partial')
    }

    onAssigned()
    return true
  }

  return {
    teacherOptions,
    mainTeacherOptions,
    studentOptions,
    selectedPrimaryTeacherId,
    setSelectedPrimaryTeacherId,
    selectedCoTeacherIds,
    setSelectedCoTeacherIds,
    selectedStudentIds,
    setSelectedStudentIds,
    showMainTeacherPicker: !primaryTeacherId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    reset,
    handleSubmit,
    newCoTeacherIds,
    newStudentIds,
    newPrimaryTeacher,
  }
}
