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
 * Check whether the current user is following the given teacher.
 */
export async function isFollowing(teacherId: string): Promise<boolean> {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) return false

  const { data, error } = await supabase
    .from('teacher_followers')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('student_id', currentUserId)
    .maybeSingle()

  if (error) {
    console.error('Error checking follow status:', error)
    return false
  }

  return !!data
}

/**
 * Follow a teacher via the follow_teacher RPC. RLS enforces same-institution.
 */
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
 * Unfollow a teacher (direct delete). RLS allows when student_id = auth.uid().
 */
export async function unfollow(teacherId: string): Promise<void> {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) throw new Error('Not authenticated')

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
