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

// Course card props for display
export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  teacherAvatar?: string;
  teacherInitials?: string;
  onView?: (id: string) => void;
}

