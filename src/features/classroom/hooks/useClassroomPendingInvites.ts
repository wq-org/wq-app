import { useCallback, useEffect, useState } from 'react'

import { listClassroomPendingInvites } from '../api/classroomInvitesApi'
import type { ClassroomPendingInvite } from '../types/classroom.types'

export function useClassroomPendingInvites(classroomId: string | undefined) {
  const [invites, setInvites] = useState<ClassroomPendingInvite[]>([])
  const [loading, setLoading] = useState(Boolean(classroomId?.trim()))
  const [error, setError] = useState<string | null>(null)

  const fetchInvites = useCallback(async () => {
    const id = classroomId?.trim()
    if (!id) {
      setInvites([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await listClassroomPendingInvites(id)
      setInvites(rows)
    } catch (err: unknown) {
      setInvites([])
      setError(err instanceof Error ? err.message : 'Failed to fetch pending invites')
    } finally {
      setLoading(false)
    }
  }, [classroomId])

  useEffect(() => {
    void fetchInvites()
  }, [fetchInvites])

  return { invites, loading, error, refresh: fetchInvites }
}
