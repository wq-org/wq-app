import { useCallback, useState } from 'react'
import {
  createTopic as createTopicApi,
  deleteTopic as deleteTopicApi,
  getTopicById as getTopicByIdApi,
  getTopicsByCourseId,
} from '../api/topicsApi'
import type { CreateTopicData, Topic } from '../types/topic.types'

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTopicsByCourseId = useCallback(async (courseId: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getTopicsByCourseId(courseId)
      setTopics(data)
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topics'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTopicById = useCallback(async (topicId: string) => {
    setLoading(true)
    setError(null)

    try {
      const topic = await getTopicByIdApi(topicId)
      setSelectedTopic(topic)
      return topic
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topic'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createTopic = useCallback(async (courseId: string, data: CreateTopicData) => {
    setLoading(true)
    setError(null)

    try {
      const createdTopic = await createTopicApi(courseId, data)
      setTopics((prev) => [...prev, createdTopic])
      return createdTopic
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create topic'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTopic = useCallback(async (topicId: string) => {
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

  return {
    topics,
    selectedTopic,
    loading,
    error,
    setSelectedTopic,
    fetchTopicsByCourseId,
    fetchTopicById,
    createTopic,
    deleteTopic,
  }
}
