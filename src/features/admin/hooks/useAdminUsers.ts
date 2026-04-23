import { useState, useEffect, useMemo } from 'react'
import { listAdminUsers, deleteUserCompletely, setUserActiveStatus } from '../api/userApi'
import type { AdminUserRow, AdminDeleteUserResult, AdminSetUserActiveResult } from '../api/userApi'

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAdminUsers()
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  const sortedUsers = useMemo(
    () =>
      [...users]
        .filter((user) => user.role !== 'super_admin')
        .sort((a, b) =>
          (a.display_name || a.username || '').localeCompare(b.display_name || b.username || ''),
        ),
    [users],
  )

  const removeUser = async (userId: string, username: string): Promise<AdminDeleteUserResult> => {
    const result = await deleteUserCompletely(userId, username)
    setUsers((prev) => prev.filter((u) => u.user_id !== userId))
    return result
  }

  const toggleUserActive = async (
    userId: string,
    nextActive: boolean,
  ): Promise<AdminSetUserActiveResult> => {
    const result = await setUserActiveStatus(userId, nextActive)
    setUsers((prev) =>
      prev.map((u) => (u.user_id === userId ? { ...u, is_active: result.is_active } : u)),
    )
    return result
  }

  return { users: sortedUsers, isLoading, error, removeUser, toggleUserActive }
}
