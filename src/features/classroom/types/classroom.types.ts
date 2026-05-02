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
