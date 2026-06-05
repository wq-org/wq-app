import { useCallback, useEffect, useState } from 'react'

import { listClassroomStudents } from '../api/classroomStudentsApi'
import type { ClassroomStudent } from '../types/classroom.types'

export function useClassroomStudents(classroomId: string | undefined) {
  const [students, setStudents] = useState<ClassroomStudent[]>([])
  const [loading, setLoading] = useState(Boolean(classroomId?.trim()))
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    const id = classroomId?.trim()
    if (!id) {
      setStudents([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await listClassroomStudents(id)
      setStudents(rows)
    } catch (err: unknown) {
      setStudents([])
      setError(err instanceof Error ? err.message : 'Failed to fetch classroom students')
    } finally {
      setLoading(false)
    }
  }, [classroomId])

  useEffect(() => {
    void fetchStudents()
  }, [fetchStudents])

  return { students, loading, error, fetchStudents }
}
