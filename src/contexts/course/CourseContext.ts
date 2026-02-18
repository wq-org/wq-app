import { createContext, useContext } from 'react'
import type {
  Course,
  CreateCourseData,
  UpdateCourseData,
} from '@/features/course/types/course.types'

// Re-export types for backward compatibility
export type {
  Course,
  CreateCourseData,
  UpdateCourseData,
} from '@/features/course/types/course.types'

export interface CourseContextValue {
  courses: Course[]
  selectedCourse: Course | null
  loading: boolean
  error: string | null
  fetchCourses: () => Promise<void>
  createCourse: (
    data: Omit<CreateCourseData, 'teacher_id' | 'institution_id'>,
  ) => Promise<Course | null>
  updateCourse: (id: string, data: UpdateCourseData) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  refreshCourses: () => Promise<void>
  setSelectedCourse: (course: Course | null) => void
  fetchCourseById: (courseId: string) => Promise<void>
}

export const CourseContext = createContext<CourseContextValue>({
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
  fetchCourses: async () => {},
  createCourse: async () => null,
  updateCourse: async () => {},
  deleteCourse: async () => {},
  refreshCourses: async () => {},
  setSelectedCourse: () => {},
  fetchCourseById: async () => {},
})

export const useCourse = () => useContext(CourseContext)
