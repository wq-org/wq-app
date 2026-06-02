import { useEffect, useState } from 'react'

import { getClassroomById } from '../api/classroomApi'
import type { ClassroomSummary } from '../types/classroom.types'

export function useClassroomDetail(classroomId: string | undefined) {
  const [classroom, setClassroom] = useState<ClassroomSummary | null>(null)
  const [loading, setLoading] = useState(Boolean(classroomId?.trim()))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = classroomId?.trim()
    if (!id) {
      setClassroom(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void getClassroomById(id)
      .then((row) => {
        if (!cancelled) {
          setClassroom(row)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setClassroom(null)
          setError(e instanceof Error ? e.message : 'Failed to load classroom')
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
  }, [classroomId])

  return { classroom, loading, error }
}
