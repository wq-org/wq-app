import { useCallback, useEffect, useMemo, useState } from 'react'
import { getGameForStudio, getLatestPublishedGameVersion } from '../api/gameStudioApi'
import type { PublishedGameVersion } from '../types/game-version.types'
import type { GameDraftDiff } from '../types/game-version.types'
import { buildGameReleaseDiff } from '../utils/gameLifecycle.utils'
import type { FlowGameConfig } from '../types/game-studio.types'

type UseGameReleaseStatusParams = {
  gameId: string | undefined
}

type UseGameReleaseStatusResult = {
  live: PublishedGameVersion | null
  diff: GameDraftDiff | null
  courseId: string | null
  deliveryCount: number
  offlineDeliveryCount: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useGameReleaseStatus({
  gameId,
}: UseGameReleaseStatusParams): UseGameReleaseStatusResult {
  const [live, setLive] = useState<PublishedGameVersion | null>(null)
  const [currentContent, setCurrentContent] = useState<FlowGameConfig | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!gameId) return
    setLoading(true)
    setError(null)
    try {
      const [game, publishedVersion] = await Promise.all([
        getGameForStudio(gameId),
        getLatestPublishedGameVersion(gameId),
      ])
      setCurrentContent(game?.game_content ?? null)
      setCourseId(game?.course_id ?? null)
      setLive(publishedVersion)
    } catch (err) {
      console.error('[useGameReleaseStatus]', err)
      setError(err instanceof Error ? err.message : 'Failed to load release status')
    } finally {
      setLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    void fetch()
  }, [fetch])

  const diff = useMemo(() => {
    if (!live) return null
    return buildGameReleaseDiff(currentContent, live.content)
  }, [live, currentContent])

  return {
    live,
    diff,
    courseId,
    deliveryCount: 0,
    offlineDeliveryCount: 0,
    loading,
    error,
    refetch: fetch,
  }
}
