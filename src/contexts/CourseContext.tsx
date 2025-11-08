import React, { createContext, useContext, useState, useCallback } from "react";

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
  institution_id: string;
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
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  createCourse: (data: CreateCourseData) => Promise<Course | null>;
  updateCourse: (id: string, data: UpdateCourseData) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextValue>({
  courses: [],
  loading: false,
  error: null,
  fetchCourses: async () => {},
  createCourse: async () => null,
  updateCourse: async () => {},
  deleteCourse: async () => {},
  refreshCourses: async () => {},
});

export const useCourseContext = () => useContext(CourseContext);

// Example empty provider, implement logic as needed
export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dummy / placeholder async methods
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Fetch logic goes here
    setCourses([]); // set with fetched data
    setLoading(false);
  }, []);

  const createCourse = useCallback(async (data: CreateCourseData): Promise<Course | null> => {
    // Your create logic here
    return null;
  }, []);

  const updateCourse = useCallback(async (id: string, data: UpdateCourseData): Promise<void> => {
    // Your update logic here
  }, []);

  const deleteCourse = useCallback(async (id: string): Promise<void> => {
    // Your delete logic here
  }, []);

  const refreshCourses = useCallback(async () => {
    await fetchCourses();
  }, [fetchCourses]);

  const value: CourseContextValue = {
    courses,
    loading,
    error,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshCourses,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};
