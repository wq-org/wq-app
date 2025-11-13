import React, { useState, useCallback } from 'react';
import { createLesson as createLessonApi, updateLesson as updateLessonApi, getLessonById as getLessonByIdApi } from '@/features/lessons/api/lessonsApi';
import { LessonContext, type LessonContextValue } from './LessonContext';
import type { Lesson, CreateLessonData } from '@/features/lessons/types/lesson.types';

export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessonById = useCallback(async (lessonId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLesson = await getLessonByIdApi(lessonId);
      setLesson(fetchedLesson);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lesson';
      setError(errorMessage);
      console.error('Error fetching lesson:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLesson = useCallback(async (data: CreateLessonData): Promise<Lesson> => {
    setLoading(true);
    setError(null);
    try {
      const newLesson = await createLessonApi(data);
      setLesson(newLesson);
      return newLesson;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lesson';
      setError(errorMessage);
      console.error('Error creating lesson:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLesson = useCallback(async (updates: Partial<{ title: string; content: string; description: string }>) => {
    if (!lesson?.id) {
      throw new Error('No lesson selected');
    }

    setLoading(true);
    setError(null);
    try {
      const updatedLesson = await updateLessonApi(lesson.id, updates);
      setLesson(updatedLesson);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lesson';
      setError(errorMessage);
      console.error('Error updating lesson:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [lesson?.id]);

  const value: LessonContextValue = {
    lesson,
    loading,
    error,
    setLesson,
    fetchLessonById,
    createLesson,
    updateLesson,
  };

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  );
};

