import { createContext, useContext } from 'react'
import type { CreateLessonData, Lesson, LessonPage, UpdateLessonData } from '@/features/lesson'

export type { CreateLessonData, Lesson } from '@/features/lesson'

export type LessonContextValue = {
  lessons: Lesson[]
  lesson: Lesson | null
  loading: boolean
  error: string | null
  fetchLessonsByTopicId: (topicId: string) => Promise<Lesson[]>
  setLesson: (lesson: Lesson | null) => void
  fetchLessonById: (lessonId: string) => Promise<Lesson>
  createLesson: (data: CreateLessonData) => Promise<Lesson>
  updateLesson: (updates: UpdateLessonData, lessonId?: string) => Promise<Lesson>
  updateLessonPages: (pages: LessonPage[], lessonId?: string) => Promise<Lesson>
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
  updateLesson: async () => ({}) as Lesson,
  updateLessonPages: async () => ({}) as Lesson,
  deleteLesson: async () => {},
})

export const useLesson = () => useContext(LessonContext)
