import { supabase } from '@/lib/supabase'
import {
  getTeacherPendingFollowRequests,
  respondFollowRequest,
} from '@/features/profiles/api/followApi'
import type {
  NotificationFollowRequest,
  NotificationProfileSummary,
} from '../types/notification-requests.types'

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
