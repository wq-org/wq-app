import { useCallback, useEffect, useState } from 'react'

import { listTeacherClassrooms } from '../api/classroomsTeacherApi'
import type { TeacherClassroomListRow } from '../types/classroom.types'

export function useTeacherClassrooms(enabled: boolean) {
  const [rows, setRows] = useState<TeacherClassroomListRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setRows([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await listTeacherClassrooms()
        if (!cancelled) {
          setRows(data)
        }
      } catch (e) {
        if (!cancelled) {
          setRows([])
          setError(e instanceof Error ? e.message : 'Failed to load classrooms')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [enabled, refreshKey])

  const reload = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return { rows, loading, error, reload }
}
