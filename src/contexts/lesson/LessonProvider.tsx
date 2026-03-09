import { useState, useCallback, type FC, type ReactNode } from 'react'
import {
  createLesson as createLessonApi,
  deleteLesson as deleteLessonApi,
  updateLesson as updateLessonApi,
  getLessonById as getLessonByIdApi,
  getLessonsByTopicId as getLessonsByTopicIdApi,
} from '@/features/lesson'
import { LessonContext } from './LessonContext'
import type { Lesson, CreateLessonData } from '@/features/lesson'

export const LessonProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLessonsByTopicId = useCallback(async (topicId: string): Promise<Lesson[]> => {
    setLoading(true)
    setError(null)
    try {
      const fetchedLessons = await getLessonsByTopicIdApi(topicId)
      setLessons(fetchedLessons)
      return fetchedLessons
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lessons'
      setError(errorMessage)
      console.error('Error fetching lessons:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLessonById = useCallback(async (lessonId: string): Promise<Lesson> => {
    setLoading(true)
    setError(null)
    setLesson(null)
    try {
      const fetchedLesson = await getLessonByIdApi(lessonId)
      setLesson(fetchedLesson)
      return fetchedLesson
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lesson'
      setError(errorMessage)
      console.error('Error fetching lesson:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createLesson = useCallback(async (data: CreateLessonData): Promise<Lesson> => {
    setLoading(true)
    setError(null)
    try {
      const newLesson = await createLessonApi(data)
      setLesson(newLesson)
      setLessons((prev) => [...prev, newLesson])
      return newLesson
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lesson'
      setError(errorMessage)
      console.error('Error creating lesson:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateLesson = useCallback(
    async (
      updates: Partial<{ title: string; content: string; description: string }>,
      lessonId?: string,
    ) => {
      const targetLessonId = lessonId ?? lesson?.id
      if (!targetLessonId) {
        throw new Error('No lesson selected')
      }

      setLoading(true)
      setError(null)
      try {
        const updatedLesson = await updateLessonApi(targetLessonId, updates)
        setLesson(updatedLesson)
        setLessons((prev) =>
          prev.map((existingLesson) =>
            existingLesson.id === targetLessonId ? updatedLesson : existingLesson,
          ),
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update lesson'
        setError(errorMessage)
        console.error('Error updating lesson:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [lesson?.id],
  )

  const deleteLesson = useCallback(async (lessonId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await deleteLessonApi(lessonId)
      setLessons((prev) => prev.filter((existingLesson) => existingLesson.id !== lessonId))
      setLesson((prev) => (prev?.id === lessonId ? null : prev))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lesson'
      setError(errorMessage)
      console.error('Error deleting lesson:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value: LessonContextValue = {
    lessons,
    lesson,
    loading,
    error,
    fetchLessonsByTopicId,
    setLesson,
    fetchLessonById,
    createLesson,
    updateLesson,
    deleteLesson,
  }

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>
}
