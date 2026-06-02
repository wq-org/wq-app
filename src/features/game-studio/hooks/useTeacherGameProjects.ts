import { useCallback, useEffect, useState } from 'react'
import type { ThemeId } from '@/lib/themes'

import { getTeacherFlowGames } from '../api/gameStudioApi'

type GameProjectStatus = 'draft' | 'published'

type TeacherGameProject = {
  id: string
  title?: string
  description?: string
  themeId?: ThemeId
  version?: number
  status: GameProjectStatus
}

type UseTeacherGameProjectsResult = {
  projects: TeacherGameProject[]
  loading: boolean
  error: string | null
}

export function useTeacherGameProjects(teacherId?: string): UseTeacherGameProjectsResult {
  const [projects, setProjects] = useState<TeacherGameProject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!teacherId) {
      setProjects([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const games = await getTeacherFlowGames(teacherId)
      const mapped = games.map((game) => ({
        id: game.id,
        title: game.title,
        description: game.description ?? undefined,
        themeId: game.theme_id,
        version: game.version ?? undefined,
        status: (game.status === 'published' ? 'published' : 'draft') as 'draft' | 'published',
      }))

      setProjects(mapped)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch game projects')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    void fetchProjects()
  }, [fetchProjects])

  return { projects, loading, error }
}
