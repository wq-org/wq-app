import { createContext, useContext } from 'react'
import type { CreateTopicData, Topic } from '@/features/topic/types/topic.types'

export type { Topic, CreateTopicData } from '@/features/topic/types/topic.types'

export interface TopicContextValue {
  topics: Topic[]
  selectedTopic: Topic | null
  loading: boolean
  error: string | null
  setSelectedTopic: (topic: Topic | null) => void
  fetchTopicsByCourseId: (courseId: string) => Promise<Topic[]>
  fetchTopicById: (topicId: string) => Promise<Topic | null>
  createTopic: (courseId: string, data: CreateTopicData) => Promise<Topic>
  deleteTopic: (topicId: string) => Promise<void>
}

export const TopicContext = createContext<TopicContextValue>({
  topics: [],
  selectedTopic: null,
  loading: false,
  error: null,
  setSelectedTopic: () => {},
  fetchTopicsByCourseId: async () => [],
  fetchTopicById: async () => null,
  createTopic: async () => ({}) as Topic,
  deleteTopic: async () => {},
})

export const useTopic = () => useContext(TopicContext)
