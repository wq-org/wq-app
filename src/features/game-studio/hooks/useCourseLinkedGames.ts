import { useCallback, useEffect, useState } from 'react'

import { getPublishedGamesForCourse } from '../api/gameStudioApi'
import type { GameCardProps } from '../types/game-studio.types'

type UseCourseLinkedGamesResult = {
  games: GameCardProps[]
  loading: boolean
  error: string | null
}

export function useCourseLinkedGames(courseId?: string): UseCourseLinkedGamesResult {
  const [games, setGames] = useState<GameCardProps[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = useCallback(async () => {
    if (!courseId) {
      setGames([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await getPublishedGamesForCourse(courseId)
      setGames(rows)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course games')
      setGames([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    void fetchGames()
  }, [fetchGames])

  return { games, loading, error }
}
