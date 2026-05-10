import { createContext, useContext } from 'react'
import type { CreateLessonData, Lesson, UpdateLessonData } from '@/features/lesson'

export type { CreateLessonData, Lesson } from '@/features/lesson'

export type LessonContextValue = {
  lessons: Lesson[]
  lesson: Lesson | null
  /** True while the topic-scoped list is being fetched, created, or deleted. */
  listLoading: boolean
  /** True while the single lesson header is being fetched or updated. */
  lessonLoading: boolean
  /**
   * Aggregate flag that ORs `listLoading` and `lessonLoading`.
   * Prefer the specific flags above to avoid spinner flicker when independent
   * actions race (e.g. fetching the list while opening one lesson).
   */
  loading: boolean
  error: string | null
  fetchLessonsByTopicId: (topicId: string) => Promise<Lesson[]>
  setLesson: (lesson: Lesson | null) => void
  fetchLessonById: (lessonId: string) => Promise<Lesson>
  createLesson: (data: CreateLessonData) => Promise<Lesson>
  updateLesson: (updates: UpdateLessonData, lessonId?: string) => Promise<Lesson>
  deleteLesson: (lessonId: string) => Promise<void>
}

export const LessonContext = createContext<LessonContextValue>({
  lessons: [],
  lesson: null,
  listLoading: false,
  lessonLoading: false,
  loading: false,
  error: null,
  fetchLessonsByTopicId: async () => [],
  setLesson: () => {},
  fetchLessonById: async () => ({}) as Lesson,
  createLesson: async () => ({}) as Lesson,
  updateLesson: async () => ({}) as Lesson,
  deleteLesson: async () => {},
})

export const useLesson = () => useContext(LessonContext)
