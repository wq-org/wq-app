import { createContext, useContext } from 'react'
import type { Lesson, CreateLessonData } from '@/features/course/types/lesson.types'

// Re-export types for backward compatibility
export type { Lesson, CreateLessonData } from '@/features/course/types/lesson.types'

export interface LessonContextValue {
  lesson: Lesson | null
  loading: boolean
  error: string | null
  setLesson: (lesson: Lesson | null) => void
  fetchLessonById: (lessonId: string) => Promise<Lesson>
  createLesson: (data: CreateLessonData) => Promise<Lesson>
  updateLesson: (
    updates: Partial<{ title: string; content: string; description: string }>,
  ) => Promise<void>
}

export const LessonContext = createContext<LessonContextValue>({
  lesson: null,
  loading: false,
  error: null,
  setLesson: () => {},
  fetchLessonById: async () => ({}) as Lesson,
  createLesson: async () => ({}) as Lesson,
  updateLesson: async () => {},
})

export const useLesson = () => useContext(LessonContext)
