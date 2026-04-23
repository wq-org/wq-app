import { supabase } from '@/lib/supabase'

export type AdminUserRow = {
  user_id: string
  display_name: string | null
  email: string | null
  username: string | null
  role: string | null
  avatar_url: string | null
  institution_count: number
  is_active: boolean
}

export type AdminDeleteUserResult = {
  deleted_user_id: string
  deleted_username: string
  deleted_storage_objects: number
}

export type AdminSetUserActiveResult = {
  updated_user_id: string
  is_active: boolean
  banned_until: string | null
}

/** Super-admin RPC: list all users with institution counts. */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const { data, error } = await supabase.rpc('list_admin_users')

  if (error) {
    console.error('Error listing admin users:', error)
    throw error
  }

  return (data ?? []) as AdminUserRow[]
}

/** Super-admin RPC: hard-delete user from profiles/auth and files storage metadata. */
export async function deleteUserCompletely(
  userId: string,
  expectedUsername: string,
): Promise<AdminDeleteUserResult> {
  const { data, error } = await supabase.rpc('admin_delete_user', {
    target_user_id: userId,
    expected_username: expectedUsername,
  })

  if (error) {
    console.error('Error deleting user completely:', error)
    throw error
  }

  return (data ?? {}) as AdminDeleteUserResult
}

/** Super-admin RPC: activate/deactivate user login access in auth.users. */
export async function setUserActiveStatus(
  userId: string,
  setActive: boolean,
): Promise<AdminSetUserActiveResult> {
  const { data, error } = await supabase.rpc('admin_set_user_active_status', {
    target_user_id: userId,
    set_active: setActive,
  })

  if (error) {
    console.error('Error setting user active status:', error)
    throw error
  }

  const row = Array.isArray(data) ? data[0] : data
  return (row ?? {}) as AdminSetUserActiveResult
}
