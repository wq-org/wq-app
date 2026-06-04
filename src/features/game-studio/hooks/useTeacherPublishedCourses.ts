import { useEffect, useState } from 'react'

import { getTeacherPublishedCourses, type Course } from '@/features/course'

type UseTeacherPublishedCoursesResult = {
  courses: Course[]
  loading: boolean
}

/** Loads published courses for optional game–course linking in the publish drawer. */
export function useTeacherPublishedCourses(
  teacherId: string | undefined,
  enabled: boolean,
): UseTeacherPublishedCoursesResult {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !teacherId) {
      setCourses([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    getTeacherPublishedCourses(teacherId)
      .then((rows) => {
        if (!cancelled) setCourses(rows)
      })
      .catch((err) => {
        console.error('[useTeacherPublishedCourses]', err)
        if (!cancelled) setCourses([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [teacherId, enabled])

  return { courses, loading }
}
