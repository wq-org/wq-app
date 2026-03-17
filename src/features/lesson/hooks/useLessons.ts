import { useCallback, useState } from 'react'
import {
  createLesson as createLessonApi,
  deleteLesson as deleteLessonApi,
  getLessonById as getLessonByIdApi,
  getLessonsByTopicId,
  updateLesson as updateLessonApi,
  updateLessonPages as updateLessonPagesApi,
} from '../api/lessonsApi'
import type { CreateLessonData, Lesson, LessonPage, UpdateLessonData } from '../types/lesson.types'

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLessonsByTopicId = useCallback(async (topicId: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await getLessonsByTopicId(topicId)
      setLessons(data)
      return data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lessons'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLessonById = useCallback(async (lessonId: string) => {
    setLoading(true)
    setError(null)

    try {
      const fetchedLesson = await getLessonByIdApi(lessonId)
      setLesson(fetchedLesson)
      return fetchedLesson
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lesson'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createLesson = useCallback(async (data: CreateLessonData) => {
    setLoading(true)
    setError(null)

    try {
      const createdLesson = await createLessonApi(data)
      setLesson(createdLesson)
      setLessons((prev) => [...prev, createdLesson])
      return createdLesson
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create lesson'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateLesson = useCallback(async (lessonId: string, updates: UpdateLessonData) => {
    setLoading(true)
    setError(null)

    try {
      const updatedLesson = await updateLessonApi(lessonId, updates)
      setLesson(updatedLesson)
      setLessons((prev) =>
        prev.map((existingLesson) =>
          existingLesson.id === lessonId ? updatedLesson : existingLesson,
        ),
      )
      return updatedLesson
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update lesson'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateLessonPages = useCallback(async (lessonId: string, pages: LessonPage[]) => {
    setLoading(true)
    setError(null)

    try {
      const updatedLesson = await updateLessonPagesApi(lessonId, pages)
      setLesson(updatedLesson)
      setLessons((prev) =>
        prev.map((existingLesson) =>
          existingLesson.id === lessonId ? updatedLesson : existingLesson,
        ),
      )
      return updatedLesson
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update lesson pages'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteLesson = useCallback(async (lessonId: string) => {
    setLoading(true)
    setError(null)

    try {
      await deleteLessonApi(lessonId)
      setLessons((prev) => prev.filter((existingLesson) => existingLesson.id !== lessonId))
      setLesson((prev) => (prev?.id === lessonId ? null : prev))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete lesson'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    lessons,
    lesson,
    loading,
    error,
    setLesson,
    fetchLessonsByTopicId,
    fetchLessonById,
    createLesson,
    updateLesson,
    updateLessonPages,
    deleteLesson,
  }
}
