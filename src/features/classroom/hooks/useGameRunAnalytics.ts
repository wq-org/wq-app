import { useCallback, useEffect, useState } from 'react'

import { getGameRunAnalyticsDetail, listGameRunAnalytics } from '../api/classroomGamesApi'
import type { GameRunAnalyticsDetail, GameRunAnalyticsItem } from '../types/classroom-game.types'

export function useGameRunAnalytics(classroomId: string | undefined, gameId: string | undefined) {
  const [runs, setRuns] = useState<GameRunAnalyticsItem[]>([])
  const [loading, setLoading] = useState(Boolean(classroomId?.trim() && gameId?.trim()))
  const [error, setError] = useState<string | null>(null)

  const fetchRuns = useCallback(async () => {
    const trimmedClassroomId = classroomId?.trim()
    const trimmedGameId = gameId?.trim()
    if (!trimmedClassroomId || !trimmedGameId) {
      setRuns([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await listGameRunAnalytics(trimmedClassroomId, trimmedGameId)
      setRuns(rows)
    } catch (err: unknown) {
      setRuns([])
      setError(err instanceof Error ? err.message : 'Failed to fetch game run analytics')
    } finally {
      setLoading(false)
    }
  }, [classroomId, gameId])

  useEffect(() => {
    void fetchRuns()
  }, [fetchRuns])

  return { runs, loading, error, fetchRuns }
}

export function useGameRunAnalyticsDetail(
  classroomId: string | undefined,
  gameId: string | undefined,
  runId: string | undefined,
) {
  const [detail, setDetail] = useState<GameRunAnalyticsDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(async () => {
    const trimmedClassroomId = classroomId?.trim()
    const trimmedGameId = gameId?.trim()
    const trimmedRunId = runId?.trim()
    if (!trimmedClassroomId || !trimmedGameId || !trimmedRunId) {
      setDetail(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const row = await getGameRunAnalyticsDetail(trimmedClassroomId, trimmedGameId, trimmedRunId)
      setDetail(row)
    } catch (err: unknown) {
      setDetail(null)
      setError(err instanceof Error ? err.message : 'Failed to fetch game run detail')
    } finally {
      setLoading(false)
    }
  }, [classroomId, gameId, runId])

  useEffect(() => {
    void fetchDetail()
  }, [fetchDetail])

  return { detail, loading, error, fetchDetail }
}
