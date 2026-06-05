export type ClassroomSummary = {
  id: string
  title: string
}

/** Row for teacher dashboard / lists: scoped by RLS to classrooms the caller may teach. */
export type TeacherClassroomListRow = {
  id: string
  title: string
  studentCount: number
}

export type ClassroomStudentProfile = {
  display_name: string | null
  username: string | null
  email: string | null
  avatar_url: string | null
  description: string | null
}

export type ClassroomStudentRow = {
  id: string
  user_id: string
  profiles: ClassroomStudentProfile | readonly ClassroomStudentProfile[] | null
}

/** Active student member in a classroom (teacher-facing UI model). */
export type ClassroomStudent = {
  id: string
  userId: string
  displayName: string | null
  username: string | null
  /** Resolved label for tooltips and aria (displayName → username → email → userId). */
  name: string
  email: string
  description: string | null
  avatarUrl: string | null
}
