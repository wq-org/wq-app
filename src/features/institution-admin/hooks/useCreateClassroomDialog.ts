import { useEffect, useState } from 'react'

import { createClassroom } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'
import type { ClassroomRecord } from '../types/classroom.types'
import type { InstitutionDirectoryRow } from '../types/institution-users.types'

type TeacherOption = {
  id: string
  label: string
  email: string
}

type UseCreateClassroomDialogParams = {
  institutionId: string | null
  open: boolean
  onCreated: (classroom: ClassroomRecord) => void
}

export function useCreateClassroomDialog({
  institutionId,
  open,
  onCreated,
}: UseCreateClassroomDialogParams) {
  const [title, setTitle] = useState('')
  const [teachers, setTeachers] = useState<readonly TeacherOption[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
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
        const directoryRows = await fetchInstitutionUserDirectory(institutionId)

        if (cancelled) return

        setTeachers(toTeacherOptions(directoryRows))
      } catch (loadError) {
        if (!cancelled) {
          setTeachers([])
          setError(loadError instanceof Error ? loadError.message : 'Failed to load classroom form')
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

  const resetForm = () => {
    setTitle('')
    setSelectedTeacherId('')
    setError(null)
  }

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeacherId((previous) => (previous === teacherId ? '' : teacherId))
  }

  const handleSubmit = async (): Promise<boolean> => {
    if (!institutionId) {
      return false
    }

    const nextTitle = title.trim()
    if (!nextTitle) {
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createClassroom({
        institutionId,
        primaryTeacherId: selectedTeacherId || null,
        title: nextTitle,
      })
      onCreated(created)
      resetForm()
      return true
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create classroom')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    title,
    setTitle,
    teachers,
    selectedTeacherId,
    toggleTeacher,
    isLoading,
    isSubmitting,
    error,
    resetForm,
    handleSubmit,
  }
}

function toTeacherOptions(rows: readonly InstitutionDirectoryRow[]): readonly TeacherOption[] {
  return rows
    .filter((row) => row.rowKind === 'member')
    .filter((row) => row.membership_status === 'active' && row.membership_role === 'teacher')
    .map((row) => ({
      id: row.user_id,
      label: row.display_name?.trim() || row.username?.trim() || row.email?.trim() || row.user_id,
      email: row.email?.trim() || '',
    }))
}
