import { useEffect, useState } from 'react'

import { getClassroomGamePlayContent } from '../api/classroomGamesApi'
import type { ClassroomGamePlayContent } from '../types/classroom-game.types'

export function useClassroomGamePlay(classroomId: string | undefined, gameId: string | undefined) {
  const [content, setContent] = useState<ClassroomGamePlayContent | null>(null)
  const [loading, setLoading] = useState(Boolean(classroomId?.trim() && gameId?.trim()))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmedClassroomId = classroomId?.trim()
    const trimmedGameId = gameId?.trim()
    if (!trimmedClassroomId || !trimmedGameId) {
      setContent(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getClassroomGamePlayContent(trimmedClassroomId, trimmedGameId)
      .then((row) => {
        if (!cancelled) setContent(row)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setContent(null)
        setError(err instanceof Error ? err.message : 'Failed to load game content')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [classroomId, gameId])

  return { content, loading, error }
}
