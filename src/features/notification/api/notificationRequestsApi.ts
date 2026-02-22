import { supabase } from '@/lib/supabase'
import { getCourseJoinRequests, respondCourseJoin } from '@/features/course/api/enrollmentsApi'
import {
  getTeacherPendingFollowRequests,
  respondFollowRequest,
} from '@/features/profiles/api/followApi'
import type {
  NotificationCourseJoinRequest,
  NotificationFollowRequest,
  NotificationProfileSummary,
} from '../types/notification-requests.types'

export async function getPendingCourseJoinRequestsForNotifications(): Promise<
  NotificationCourseJoinRequest[]
> {
  const rows = await getCourseJoinRequests()

  return rows
    .filter((row) => row.status === 'pending')
    .map((row) => ({
      course_id: row.course_id,
      student_id: row.student_id,
      status: row.status,
      requested_at: row.requested_at,
      responded_at: row.responded_at,
      responded_by: row.responded_by,
      note: row.note,
      enrolled_at: row.enrolled_at,
      course: row.course
        ? {
            id: row.course.id,
            title: row.course.title,
            teacher_id: row.course.teacher_id,
          }
        : null,
      student: row.student
        ? {
            user_id: row.student.user_id,
            display_name: row.student.display_name,
            avatar_url: row.student.avatar_url,
            username: row.student.username,
          }
        : null,
    }))
}

export async function respondToCourseJoinRequest(
  courseId: string,
  studentId: string,
  action: 'accept' | 'reject',
) {
  return respondCourseJoin(courseId, studentId, action)
}

async function getProfileMapByUserIds(
  userIds: string[],
): Promise<Record<string, NotificationProfileSummary>> {
  if (userIds.length === 0) return {}

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, username')
    .in('user_id', userIds)

  if (error || !data) {
    if (error) {
      console.error('Error loading profiles for notification follow requests:', error)
    }
    return {}
  }

  return data.reduce(
    (acc, profile) => {
      acc[profile.user_id] = {
        user_id: profile.user_id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        username: profile.username,
      }
      return acc
    },
    {} as Record<string, NotificationProfileSummary>,
  )
}

export async function getPendingFollowRequestsForNotifications(): Promise<
  NotificationFollowRequest[]
> {
  const rows = await getTeacherPendingFollowRequests()
  const pendingRows = rows.filter((row) => row.status === 'pending')

  const studentIds = [...new Set(pendingRows.map((row) => row.student_id))]
  const profileMap = await getProfileMapByUserIds(studentIds)

  return pendingRows.map((row) => ({
    teacher_id: row.teacher_id,
    student_id: row.student_id,
    status: row.status as NotificationFollowRequest['status'],
    requested_at: row.requested_at,
    responded_at: row.responded_at,
    responded_by: row.responded_by,
    student: profileMap[row.student_id] ?? null,
  }))
}

export async function respondToFollowRequest(
  teacherId: string,
  studentId: string,
  action: 'accept' | 'reject',
) {
  return respondFollowRequest(teacherId, studentId, action)
}
