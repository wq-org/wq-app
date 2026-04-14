import { supabase } from '@/lib/supabase'

/**
 * Get current user id from Supabase auth. Returns null if not authenticated.
 */
async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Get teacher IDs that the current user (student) follows.
 */
export async function getFollowedTeacherIds(): Promise<string[]> {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) return []

  const { data, error } = await supabase
    .from('teacher_followers')
    .select('teacher_id')
    .eq('student_id', currentUserId)

  if (error) {
    console.error('Error fetching followed teachers:', error)
    return []
  }

  return (data || []).map((row: { teacher_id: string }) => row.teacher_id)
}

/**
 * Get the number of teachers followed by a specific student.
 */
export async function getFollowedTeacherCount(studentId: string): Promise<number> {
  if (!studentId) return 0

  const { count, error } = await supabase
    .from('teacher_followers')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)

  if (error) {
    console.error('Error fetching followed teacher count:', error)
    return 0
  }

  return count ?? 0
}

export type FollowStatus = 'none' | 'accepted'

export interface FollowProfileSummary {
  user_id: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
}

async function getProfilesByIds(userIds: readonly string[]): Promise<FollowProfileSummary[]> {
  if (userIds.length === 0) return []

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, display_name, username, avatar_url')
    .in('user_id', userIds)

  if (error || !profiles) {
    if (error) {
      console.error('Error fetching follow profiles:', error)
    }

    return []
  }

  const orderMap = new Map(userIds.map((id, index) => [id, index]))

  return [...profiles].sort((a, b) => {
    const firstIndex = orderMap.get(a.user_id) ?? Number.MAX_SAFE_INTEGER
    const secondIndex = orderMap.get(b.user_id) ?? Number.MAX_SAFE_INTEGER
    return firstIndex - secondIndex
  }) as FollowProfileSummary[]
}

export async function getFollowedTeacherProfiles(): Promise<FollowProfileSummary[]> {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) return []

  const { data, error } = await supabase
    .from('teacher_followers')
    .select('teacher_id')
    .eq('student_id', currentUserId)

  if (error) {
    console.error('Error fetching followed teacher profiles:', error)
    return []
  }

  const teacherIds = (data || [])
    .map((row: { teacher_id: string }) => row.teacher_id)
    .filter(Boolean)

  return getProfilesByIds(teacherIds)
}

/**
 * Get follow status for the current user and a teacher.
 * Baseline mode only supports direct follow (accepted) or none.
 */
export async function getFollowStatus(teacherId: string): Promise<FollowStatus> {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) return 'none'

  const { data: followerRow } = await supabase
    .from('teacher_followers')
    .select('teacher_id')
    .eq('teacher_id', teacherId)
    .eq('student_id', currentUserId)
    .maybeSingle()

  if (followerRow) return 'accepted'
  return 'none'
}

/**
 * Check whether the current user is following the given teacher (accepted only).
 */
export async function isFollowing(teacherId: string): Promise<boolean> {
  const status = await getFollowStatus(teacherId)
  return status === 'accepted'
}

/**
 * Get followers (students) for the currently authenticated teacher.
 */
export async function getTeacherFollowers(): Promise<FollowProfileSummary[]> {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) return []

  const { data: followerRows, error: followerError } = await supabase
    .from('teacher_followers')
    .select('student_id')
    .eq('teacher_id', currentUserId)

  if (followerError || !followerRows) {
    if (followerError) {
      console.error('Error fetching teacher followers:', followerError)
    }
    return []
  }

  const studentIds = followerRows
    .map((row: { student_id: string }) => row.student_id)
    .filter(Boolean)

  return getProfilesByIds(studentIds)
}

/** Follow teacher immediately (baseline behavior). */
export async function follow(teacherId: string): Promise<void> {
  const { error } = await supabase.rpc('follow_teacher', {
    target_teacher_id: teacherId,
  })

  if (error) {
    console.error('Error following teacher:', error)
    throw error
  }
}

/**
 * Unfollow teacher using direct DELETE (baseline behavior; no RPC required).
 */
export async function unfollow(teacherId: string): Promise<void> {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('teacher_followers')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('student_id', currentUserId)

  if (error) {
    console.error('Error unfollowing teacher:', error)
    throw error
  }
}

// -----------------------------------------------------------------------------
// Teacher: pending follow requests
// -----------------------------------------------------------------------------

export interface FollowRequestRow {
  teacher_id: string
  student_id: string
  status: string
  requested_at: string
  responded_at: string | null
  responded_by: string | null
}

/**
 * Follow requests are disabled in baseline mode.
 * Keep this API to avoid breaking notification imports.
 */
export async function getTeacherPendingFollowRequests(): Promise<FollowRequestRow[]> {
  return []
}

/**
 * Follow requests are disabled in baseline mode.
 */
export async function respondFollowRequest(
  _teacherId: string,
  _studentId: string,
  action: 'accept' | 'reject',
): Promise<FollowStatus> {
  return action === 'accept' ? 'accepted' : 'none'
}
