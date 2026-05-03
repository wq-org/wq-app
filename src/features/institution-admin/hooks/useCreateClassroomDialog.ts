import { useCallback, useEffect, useMemo, useState } from 'react'

import { generateClassroomName } from '@/shared/utils/generateClassroomName'

import { listClassGroupOfferings } from '../api/classGroupOfferingsApi'
import { listClassGroupsByInstitution } from '../api/classGroupsApi'
import { createClassroom } from '../api/classroomsApi'
import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import type { ClassGroupRecord } from '../types/class-group.types'
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
  const [classGroups, setClassGroups] = useState<readonly ClassGroupRecord[]>([])
  const [selectedClassGroupId, setSelectedClassGroupId] = useState('')
  const [offerings, setOfferings] = useState<readonly ClassGroupOfferingRecord[]>([])
  const [selectedOfferingId, setSelectedOfferingId] = useState('')
  const [teachers, setTeachers] = useState<readonly TeacherOption[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameSuggestions, setNameSuggestions] = useState<readonly string[]>([])

  const refreshNameSuggestions = useCallback(() => {
    const suggestions = [
      generateClassroomName('superhero'),
      generateClassroomName('superhero'),
      generateClassroomName('luxury'),
      generateClassroomName('luxury'),
    ]
    setNameSuggestions(suggestions)
  }, [])

  const classGroupNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const group of classGroups) {
      map.set(group.id, group.name.trim())
    }
    return map
  }, [classGroups])

  const selectedClassGroupName = classGroupNameById.get(selectedClassGroupId) ?? ''

  const selectedOffering = useMemo(
    () => offerings.find((offering) => offering.id === selectedOfferingId) ?? null,
    [offerings, selectedOfferingId],
  )

  useEffect(() => {
    if (!open || !institutionId) {
      return
    }

    refreshNameSuggestions()

    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [classGroupRows, directoryRows] = await Promise.all([
          listClassGroupsByInstitution(institutionId),
          fetchInstitutionUserDirectory(institutionId),
        ])

        if (cancelled) return

        const activeTeachers = toTeacherOptions(directoryRows)
        setClassGroups(classGroupRows)
        setTeachers(activeTeachers)
      } catch (loadError) {
        if (!cancelled) {
          setClassGroups([])
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
  }, [institutionId, open, refreshNameSuggestions])

  useEffect(() => {
    if (!open || !selectedClassGroupId) {
      setOfferings([])
      setSelectedOfferingId('')
      return
    }

    let cancelled = false
    setError(null)

    const loadOfferings = async () => {
      try {
        const rows = await listClassGroupOfferings(selectedClassGroupId)
        if (cancelled) return
        setOfferings(rows)
        setSelectedOfferingId((previous) => previous || rows[0]?.id || '')
      } catch (loadError) {
        if (!cancelled) {
          setOfferings([])
          setSelectedOfferingId('')
          setError(loadError instanceof Error ? loadError.message : 'Failed to load offerings')
        }
      }
    }

    void loadOfferings()
    return () => {
      cancelled = true
    }
  }, [open, selectedClassGroupId])

  const resetForm = () => {
    setTitle('')
    setSelectedClassGroupId('')
    setOfferings([])
    setSelectedOfferingId('')
    setSelectedTeacherId('')
    setError(null)
    setNameSuggestions([])
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
    if (!selectedClassGroupId || !selectedOfferingId) {
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const created = await createClassroom({
        institutionId,
        classGroupId: selectedClassGroupId,
        classGroupOfferingId: selectedOfferingId,
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
    nameSuggestions,
    refreshNameSuggestions,
    classGroups,
    selectedClassGroupId,
    setSelectedClassGroupId,
    selectedClassGroupName,
    offerings,
    selectedOfferingId,
    setSelectedOfferingId,
    selectedOffering,
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
