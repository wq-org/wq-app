import { createContext, useContext } from 'react'
import type { Lesson, CreateLessonData } from '@/features/lesson/types/lesson.types'

// Re-export types for backward compatibility
export type { Lesson, CreateLessonData } from '@/features/lesson/types/lesson.types'

export interface LessonContextValue {
  lessons: Lesson[]
  lesson: Lesson | null
  loading: boolean
  error: string | null
  fetchLessonsByTopicId: (topicId: string) => Promise<Lesson[]>
  setLesson: (lesson: Lesson | null) => void
  fetchLessonById: (lessonId: string) => Promise<Lesson>
  createLesson: (data: CreateLessonData) => Promise<Lesson>
  updateLesson: (
    updates: Partial<{ title: string; content: string; description: string }>,
    lessonId?: string,
  ) => Promise<void>
  deleteLesson: (lessonId: string) => Promise<void>
}

export const LessonContext = createContext<LessonContextValue>({
  lessons: [],
  lesson: null,
  loading: false,
  error: null,
  fetchLessonsByTopicId: async () => [],
  setLesson: () => {},
  fetchLessonById: async () => ({}) as Lesson,
  createLesson: async () => ({}) as Lesson,
  updateLesson: async () => {},
  deleteLesson: async () => {},
})

export const useLesson = () => useContext(LessonContext)
