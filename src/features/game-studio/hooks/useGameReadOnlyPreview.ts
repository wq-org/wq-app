import { useCallback, useEffect, useState } from 'react'

import type { ThemeId } from '@/lib/themes'

import { fetchGameDraftSnapshot } from '../api/gameReleaseApi'
import { getLatestPublishedGameVersion } from '../api/gameStudioApi'
import type { FlowGameConfig } from '../types/game-studio.types'

export type GameReadOnlyPreviewStatus = 'published' | 'draft'

export type GameReadOnlyPreview = {
  gameId: string
  title: string
  description: string | null
  themeId: ThemeId
  content: FlowGameConfig | null
  status: GameReadOnlyPreviewStatus
  versionNo: number | null
  publishedAt: Date | null
}

type UseGameReadOnlyPreviewResult = {
  preview: GameReadOnlyPreview | null
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

export function useGameReadOnlyPreview(gameId: string | undefined): UseGameReadOnlyPreviewResult {
  const [preview, setPreview] = useState<GameReadOnlyPreview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPreview = useCallback(async () => {
    const trimmedGameId = gameId?.trim()
    if (!trimmedGameId) {
      setPreview(null)
      setError('invalid_game')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [draft, live] = await Promise.all([
        fetchGameDraftSnapshot(trimmedGameId),
        getLatestPublishedGameVersion(trimmedGameId),
      ])

      if (live) {
        setPreview({
          gameId: live.gameId,
          title: live.gameTitle,
          description: live.gameDescription,
          themeId: live.themeId,
          content: live.content,
          status: 'published',
          versionNo: live.versionNo,
          publishedAt: live.publishedAt,
        })
        setError(null)
        return
      }

      if (draft) {
        setPreview({
          gameId: draft.gameId,
          title: draft.title,
          description: draft.description,
          themeId: draft.themeId,
          content: draft.content,
          status: 'draft',
          versionNo: null,
          publishedAt: null,
        })
        setError(null)
        return
      }

      setPreview(null)
      setError('game_not_found')
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setIsLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    void loadPreview()
  }, [loadPreview])

  return {
    preview,
    isLoading,
    error,
    reload: loadPreview,
  }
}
