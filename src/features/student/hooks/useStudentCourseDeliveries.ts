import { useCallback, useEffect, useState } from 'react'

import {
  getStudentCourseDeliveries,
  type StudentCourseDelivery,
} from '../api/studentCourseDeliveriesApi'

export function useStudentCourseDeliveries(enabled: boolean) {
  const [courses, setCourses] = useState<StudentCourseDelivery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    if (!enabled) {
      setCourses([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await getStudentCourseDeliveries()
      setCourses(rows)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void fetchCourses()
  }, [fetchCourses])

  return { courses, loading, error, fetchCourses }
}
