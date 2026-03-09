import { useCallback, useState, type FC, type ReactNode } from 'react'
import {
  createTopic as createTopicApi,
  deleteTopic as deleteTopicApi,
  getTopicById as getTopicByIdApi,
  getTopicsByCourseId,
  updateTopic as updateTopicApi,
} from '@/features/topic'
import type { CreateTopicData, Topic } from '@/features/topic'
import { TopicContext, type TopicContextValue } from './TopicContext'

export const TopicProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTopicsByCourseId = useCallback(async (courseId: string): Promise<Topic[]> => {
    setLoading(true)
    setError(null)

    try {
      const fetchedTopics = await getTopicsByCourseId(courseId)
      setTopics(fetchedTopics)
      setSelectedTopic((prev) => {
        if (!prev) return prev
        return fetchedTopics.find((topic) => topic.id === prev.id) ?? null
      })
      return fetchedTopics
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topics'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTopicById = useCallback(async (topicId: string): Promise<Topic | null> => {
    setLoading(true)
    setError(null)

    try {
      const fetchedTopic = await getTopicByIdApi(topicId)
      setSelectedTopic(fetchedTopic)
      return fetchedTopic
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topic'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createTopic = useCallback(
    async (courseId: string, data: CreateTopicData): Promise<Topic> => {
      setLoading(true)
      setError(null)

      try {
        const newTopic = await createTopicApi(courseId, data)
        setTopics((prev) => [...prev, newTopic])
        return newTopic
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create topic'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const updateTopic = useCallback(
    async (
      topicId: string,
      updates: Partial<{ title: string; description: string }>,
    ): Promise<Topic> => {
      setLoading(true)
      setError(null)

      try {
        const updatedTopic = await updateTopicApi(topicId, updates)
        setTopics((prev) => prev.map((topic) => (topic.id === topicId ? updatedTopic : topic)))
        setSelectedTopic((prev) => (prev?.id === topicId ? updatedTopic : prev))
        return updatedTopic
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update topic'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const deleteTopic = useCallback(async (topicId: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await deleteTopicApi(topicId)
      setTopics((prev) => prev.filter((topic) => topic.id !== topicId))
      setSelectedTopic((prev) => (prev?.id === topicId ? null : prev))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete topic'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value: TopicContextValue = {
    topics,
    selectedTopic,
    loading,
    error,
    setSelectedTopic,
    fetchTopicsByCourseId,
    fetchTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
  }

  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
}
