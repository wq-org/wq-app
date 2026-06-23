import { useEffect, useState } from 'react'
import { fetchTeacherLessons } from '../api/agentLessonsApi'
import type { AgentLesson } from '../types/agent.types'

export function useAgentLessons() {
  const [lessons, setLessons] = useState<AgentLesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchTeacherLessons()
      .then(setLessons)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  return { lessons, isLoading, error }
}
