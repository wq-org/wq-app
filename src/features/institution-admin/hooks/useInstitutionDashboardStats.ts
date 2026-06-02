import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import { fetchInstitutionUserDirectory } from '../api/institutionUserInvitesApi'
import { listClassroomsByInstitution } from '../api/classroomsApi'

type Options = {
  enabled?: boolean
}

export function useInstitutionDashboardStats(
  institutionId: string | null,
  { enabled = true }: Options = {},
) {
  const [studentCount, setStudentCount] = useState(0)
  const [teacherCount, setTeacherCount] = useState(0)
  const [classroomCount, setClassroomCount] = useState(0)
  const [isLoading, setIsLoading] = useState(() => Boolean(institutionId && enabled))
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!institutionId || !enabled) {
      setStudentCount(0)
      setTeacherCount(0)
      setClassroomCount(0)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const [directory, classrooms] = await Promise.all([
        fetchInstitutionUserDirectory(institutionId),
        listClassroomsByInstitution(institutionId),
      ])

      let students = 0
      let teachers = 0
      for (const row of directory) {
        if (row.membership_role === 'student') students += 1
        else if (row.membership_role === 'teacher') teachers += 1
      }

      setStudentCount(students)
      setTeacherCount(teachers)
      setClassroomCount(classrooms.length)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard stats')
      setStudentCount(0)
      setTeacherCount(0)
      setClassroomCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [institutionId, enabled])

  useLayoutEffect(() => {
    if (institutionId && enabled) {
      setIsLoading(true)
    }
  }, [institutionId, enabled])

  useEffect(() => {
    void load()
  }, [load])

  return {
    studentCount,
    teacherCount,
    classroomCount,
    isLoading,
    error,
    refresh: load,
  }
}
