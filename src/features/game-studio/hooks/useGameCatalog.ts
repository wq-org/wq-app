import { useCallback, useEffect, useState } from 'react'

import { listGameCatalog } from '../api/gameStudioApi'
import type { GameCatalogItem } from '../types/game-studio.types'

type UseGameCatalogOptions = {
  institutionId?: string | null
  enabled?: boolean
}

type UseGameCatalogResult = {
  games: GameCatalogItem[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useGameCatalog({
  institutionId,
  enabled = true,
}: UseGameCatalogOptions = {}): UseGameCatalogResult {
  const [games, setGames] = useState<GameCatalogItem[]>([])
  const [isLoading, setIsLoading] = useState(enabled && institutionId !== null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || institutionId === null) {
      setGames([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const rows = await listGameCatalog({
        institutionId: institutionId ?? undefined,
      })
      setGames(rows)
    } catch (e) {
      setGames([])
      setError(e instanceof Error ? e.message : 'Failed to load games')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, institutionId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { games, isLoading, error, refresh }
}
