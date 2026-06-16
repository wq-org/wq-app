export type ClassroomSummary = {
  id: string
  title: string
}

export type TeacherClassroomSummary = {
  id: string
  institution_id: string
  primary_teacher_id: string
  title: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
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

export type ClassroomPendingInviteRow = {
  id: string
  email: string
  expires_at: string
}

export type ClassroomPendingInvite = {
  id: string
  email: string
  expiresAt: string
}
