import { useEffect, useState } from 'react'

import { getCourseById } from '../api/coursesApi'
import type { Course } from '../types/course.types'

/** Loads a single course for student-facing detail routes (hook → api only). */
export function useCourseDetail(courseId: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(Boolean(courseId?.trim()))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = courseId?.trim()
    if (!id) {
      setCourse(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void getCourseById(id)
      .then((row) => {
        if (!cancelled) {
          setCourse(row)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setCourse(null)
          setError(e instanceof Error ? e.message : 'Failed to load course')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [courseId])

  return { course, loading, error }
}
