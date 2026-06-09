import { useCallback, useEffect, useMemo, useState } from 'react'

import { fetchGameDraftSnapshot, fetchLatestPublishedGameSnapshot } from '../api/gameReleaseApi'
import type { GameDraftSnapshot } from '../api/gameReleaseApi'
import type { GameDraftDiff } from '../types/game-version.types'
import type { PublishedGameVersion } from '../types/game-version.types'
import { buildGameReleaseDiff } from '../utils/gameLifecycle.utils'

type UseGameReleaseStatusParams = {
  gameId: string | undefined
  enabled?: boolean
}

type UseGameReleaseStatusResult = {
  draft: GameDraftSnapshot | null
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
  enabled = true,
}: UseGameReleaseStatusParams): UseGameReleaseStatusResult {
  const [draft, setDraft] = useState<GameDraftSnapshot | null>(null)
  const [live, setLive] = useState<PublishedGameVersion | null>(null)
  const [deliveryCount, setDeliveryCount] = useState(0)
  const [offlineDeliveryCount, setOfflineDeliveryCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    const trimmedGameId = gameId?.trim()
    if (!trimmedGameId || !enabled) {
      setDraft(null)
      setLive(null)
      setDeliveryCount(0)
      setOfflineDeliveryCount(0)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [nextDraft, published] = await Promise.all([
        fetchGameDraftSnapshot(trimmedGameId),
        fetchLatestPublishedGameSnapshot(trimmedGameId),
      ])

      setDraft(nextDraft)
      setLive(published.live)
      setDeliveryCount(published.deliveryCount)
      setOfflineDeliveryCount(published.offlineDeliveryCount)
    } catch (err) {
      console.error('[useGameReleaseStatus]', err)
      setDraft(null)
      setLive(null)
      setDeliveryCount(0)
      setOfflineDeliveryCount(0)
      setError(err instanceof Error ? err.message : 'Failed to load release status')
    } finally {
      setLoading(false)
    }
  }, [gameId, enabled])

  useEffect(() => {
    void fetch()
  }, [fetch])

  const diff = useMemo(() => {
    if (!draft) return null
    return buildGameReleaseDiff(
      {
        title: draft.title,
        description: draft.description,
        themeId: draft.themeId,
        content: draft.content,
      },
      live,
    )
  }, [draft, live])

  return {
    draft,
    live,
    diff,
    courseId: draft?.courseId ?? null,
    deliveryCount,
    offlineDeliveryCount,
    loading,
    error,
    refetch: fetch,
  }
}
