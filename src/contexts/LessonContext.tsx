import React, { createContext, useContext, useState, useCallback } from 'react';
import { createLesson as createLessonApi, updateLesson as updateLessonApi, getLessonById as getLessonByIdApi } from '@/features/lessons/api/lessonsApi';
import type { Lesson, CreateLessonData } from '@/features/lessons/types/lesson.types';

// Re-export types for backward compatibility
export type { Lesson, CreateLessonData } from '@/features/lessons/types/lesson.types';

interface LessonContextValue {
    lesson: Lesson | null;
    loading: boolean;
    error: string | null;
    setLesson: (lesson: Lesson | null) => void;
    fetchLessonById: (lessonId: string) => Promise<void>;
    createLesson: (data: CreateLessonData) => Promise<Lesson>;
    updateLesson: (updates: Partial<{ title: string; content: string; description: string }>) => Promise<void>;
}

const LessonContext = createContext<LessonContextValue>({
    lesson: null,
    loading: false,
    error: null,
    setLesson: () => {},
    fetchLessonById: async () => {},
    createLesson: async () => ({} as Lesson),
    updateLesson: async () => {},
});

export const useLessonContext = () => useContext(LessonContext);

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

    return (
        <LessonContext.Provider
            value={{
                lesson,
                loading,
                error,
                setLesson,
                fetchLessonById,
                createLesson,
                updateLesson,
            }}
        >
            {children}
        </LessonContext.Provider>
    );
};

