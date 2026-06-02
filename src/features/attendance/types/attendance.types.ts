/** DB row shape for `classrooms` list used by attendance picker. */
export type AttendanceClassroomRow = {
  id: string
  title: string
  institution_id: string
}

export type AttendanceClassroomOption = {
  id: string
  title: string
  institutionId: string
}

/** Linked course for a classroom (from `classroom_course_links` + `courses`). */
export type AttendanceCourseOption = {
  id: string
  title: string
}

export type AttendanceOpenSessionRow = {
  id: string
  title: string | null
  starts_at: string
  session_date: string
  course_id: string
}

export type AttendanceOpenSession = {
  id: string
  title: string | null
  startsAt: string
  sessionDate: string
  courseId: string
}

export type AttendanceSessionRow = {
  id: string
  institution_id: string
  classroom_id: string
  course_id: string
  title: string | null
  session_date: string
  starts_at: string
  ends_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type AttendanceSession = {
  id: string
  institutionId: string
  classroomId: string
  courseId: string
  title: string | null
  sessionDate: string
  startsAt: string
  endsAt: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type CreateAttendanceSessionInput = {
  classroomId: string
  courseId: string
  title: string | null
  sessionDate: string
  startsAt: string
  endsAt: string | null
}
