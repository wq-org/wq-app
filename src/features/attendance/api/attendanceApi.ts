import { supabase } from '@/lib/supabase'
import type {
  AttendanceClassroomOption,
  AttendanceClassroomRow,
  AttendanceCourseOption,
  AttendanceOpenSession,
  AttendanceOpenSessionRow,
  AttendanceSession,
  AttendanceSessionRow,
  CreateAttendanceSessionInput,
} from '../types/attendance.types'

function toAttendanceSession(row: AttendanceSessionRow): AttendanceSession {
  return {
    id: row.id,
    institutionId: row.institution_id,
    classroomId: row.classroom_id,
    courseId: row.course_id,
    title: row.title,
    sessionDate: row.session_date,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toClassroomOption(row: AttendanceClassroomRow): AttendanceClassroomOption {
  return {
    id: row.id,
    title: row.title,
    institutionId: row.institution_id,
  }
}

function toOpenSession(row: AttendanceOpenSessionRow): AttendanceOpenSession {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    sessionDate: row.session_date,
    courseId: row.course_id,
  }
}

export async function listClassroomsForAttendance(): Promise<AttendanceClassroomOption[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('id, title, institution_id')
    .eq('status', 'active')
    .order('title', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as AttendanceClassroomRow[]).map(toClassroomOption)
}

type ClassroomCourseLinkRow = {
  course_id: string
  courses: { id: string; title: string } | { id: string; title: string }[] | null
}

export async function listCoursesLinkedToClassroom(
  classroomId: string,
): Promise<AttendanceCourseOption[]> {
  const { data, error } = await supabase
    .from('classroom_course_links')
    .select('course_id, courses(id, title)')
    .eq('classroom_id', classroomId)
    .is('deleted_at', null)

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as ClassroomCourseLinkRow[]
  const out: AttendanceCourseOption[] = []
  for (const row of rows) {
    const embedded = row.courses
    const course = Array.isArray(embedded) ? embedded[0] : embedded
    if (course?.id) {
      out.push({ id: course.id, title: course.title ?? '' })
    }
  }
  return out
}

export async function listOpenAttendanceSessionsForClassroom(
  classroomId: string,
): Promise<AttendanceOpenSession[]> {
  const { data, error } = await supabase
    .from('classroom_attendance_sessions')
    .select('id, title, starts_at, session_date, course_id')
    .eq('classroom_id', classroomId)
    .is('ends_at', null)
    .order('starts_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as AttendanceOpenSessionRow[]).map(toOpenSession)
}

export async function createAttendanceSession(
  input: CreateAttendanceSessionInput,
): Promise<AttendanceSession> {
  const { data, error } = await supabase.rpc('create_classroom_attendance_session', {
    p_classroom_id: input.classroomId,
    p_course_id: input.courseId,
    p_title: input.title,
    p_session_date: input.sessionDate,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
  })

  if (error) {
    throw new Error(error.message)
  }

  return toAttendanceSession(data as AttendanceSessionRow)
}

export async function closeAttendanceSession(
  attendanceSessionId: string,
  endsAtIso: string,
): Promise<AttendanceSession> {
  const { data, error } = await supabase.rpc('close_classroom_attendance_session', {
    p_attendance_session_id: attendanceSessionId,
    p_ends_at: endsAtIso,
  })

  if (error) {
    throw new Error(error.message)
  }

  return toAttendanceSession(data as AttendanceSessionRow)
}
