import React, { createContext, useContext, useState, useCallback } from "react";
import { getTeacherCourses, getCourseById, createCourse as createCourseApi, updateCourse as updateCourseApi, deleteCourse as deleteCourseApi } from "@/features/auth/api/authApi";
import { useUser } from "./UserContext";

// Course interface, each course has the specified shape
export interface Course {
  id: string; // uuid
  title: string; // text
  description: string; // text
  teacher_id: string; // uuid
  institution_id: string; // uuid
  is_published: boolean; // bool
  created_at: string; // timestamptz (ISO string)
  updated_at: string; // timestamptz (ISO string)
}

// Type for creating a new course (no id, created_at, updated_at)
export interface CreateCourseData {
  title: string;
  description: string;
  teacher_id: string;
  institution_id?: string; // Optional, will be fetched if not provided
  is_published?: boolean;
}

// Type for updating a course (allows partial updates)
export interface UpdateCourseData {
  title?: string;
  description?: string;
  is_published?: boolean;
  // Optionally allow changes to teacher_id/institution_id,
  // but typically these are not updated
}

interface CourseContextValue {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  createCourse: (data: Omit<CreateCourseData, 'teacher_id' | 'institution_id'>) => Promise<Course | null>;
  updateCourse: (id: string, data: UpdateCourseData) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
  setSelectedCourse: (course: Course | null) => void;
  fetchCourseById: (courseId: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextValue>({
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
});

export const useCourseContext = () => useContext(CourseContext);

// CourseProvider implementation with actual API calls
export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUser();

  // Fetch all courses for the current teacher
  const fetchCourses = useCallback(async () => {
    if (!profile?.user_id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherCourses(profile.user_id);
      setCourses(data as Course[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.user_id]);

  // Fetch a single course by ID and set it as selected
  const fetchCourseById = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const course = await getCourseById(courseId);
      setSelectedCourse(course as Course);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course');
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new course
  const createCourse = useCallback(async (data: Omit<CreateCourseData, 'teacher_id' | 'institution_id'>): Promise<Course | null> => {
    if (!profile?.user_id) {
      setError('User not authenticated');
      return null;
    }

    setError(null);
    try {
      const course = await createCourseApi(profile.user_id, {
        title: data.title,
        description: data.description,
      });
      
      // Refresh courses list
      await fetchCourses();
      
      return course as Course;
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
      console.error('Error creating course:', err);
      return null;
    }
  }, [profile?.user_id, fetchCourses]);

  // Update a course
  const updateCourse = useCallback(async (id: string, data: UpdateCourseData): Promise<void> => {
    setError(null);
    try {
      await updateCourseApi(id, data);
      
      // Update in courses list
      setCourses(prev => prev.map(course => 
        course.id === id ? { ...course, ...data } as Course : course
      ));
      
      // Update selected course if it's the one being updated
      if (selectedCourse?.id === id) {
        setSelectedCourse(prev => prev ? { ...prev, ...data } as Course : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
      console.error('Error updating course:', err);
      throw err;
    }
  }, [selectedCourse]);

  // Delete a course
  const deleteCourse = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await deleteCourseApi(id);
      
      // Remove from courses list
      setCourses(prev => prev.filter(course => course.id !== id));
      
      // Clear selected course if it's the one being deleted
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete course');
      console.error('Error deleting course:', err);
      throw err;
    }
  }, [selectedCourse]);

  // Refresh courses list
  const refreshCourses = useCallback(async () => {
    await fetchCourses();
  }, [fetchCourses]);

  const value: CourseContextValue = {
    courses,
    selectedCourse,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses,
    setSelectedCourse,
    fetchCourseById,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};
