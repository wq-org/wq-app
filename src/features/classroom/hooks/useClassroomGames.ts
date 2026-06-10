import { useCallback, useEffect, useState } from 'react'

import { listClassroomDeliveredGames } from '../api/classroomGamesApi'
import type { ClassroomDeliveredGame } from '../types/classroom-game.types'

export function useClassroomGames(classroomId: string | undefined) {
  const [games, setGames] = useState<ClassroomDeliveredGame[]>([])
  const [loading, setLoading] = useState(Boolean(classroomId?.trim()))
  const [error, setError] = useState<string | null>(null)

  const fetchGames = useCallback(async () => {
    const id = classroomId?.trim()
    if (!id) {
      setGames([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await listClassroomDeliveredGames(id)
      setGames(rows)
    } catch (err: unknown) {
      setGames([])
      setError(err instanceof Error ? err.message : 'Failed to fetch classroom games')
    } finally {
      setLoading(false)
    }
  }, [classroomId])

  useEffect(() => {
    void fetchGames()
  }, [fetchGames])

  return { games, loading, error, fetchGames }
}
