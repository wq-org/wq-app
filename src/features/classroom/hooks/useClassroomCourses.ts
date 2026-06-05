import { useCallback, useEffect, useState } from 'react'

import { getClassroomCourses } from '@/features/course/api/coursesApi'
import type { Course } from '@/features/course/types/course.types'

export function useClassroomCourses(classroomId: string | undefined) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(Boolean(classroomId?.trim()))
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    const id = classroomId?.trim()
    if (!id) {
      setCourses([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await getClassroomCourses(id)
      setCourses(rows)
    } catch (err: unknown) {
      setCourses([])
      setError(err instanceof Error ? err.message : 'Failed to fetch classroom courses')
    } finally {
      setLoading(false)
    }
  }, [classroomId])

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  return { courses, loading, error, fetchCourses }
}
