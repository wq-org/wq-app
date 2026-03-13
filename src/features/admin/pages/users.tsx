import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { UserCheck, UserX } from 'lucide-react'

import { useUser } from '@/contexts/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Spinner from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Logo } from '@/components/ui/logo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  deleteUserCompletely,
  listAdminUsers,
  setUserActiveStatus,
  type AdminUserRow,
} from '../api/userApi'
import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'

function initialsFromName(name?: string | null, username?: string | null): string {
  const source = name?.trim() || username?.trim() || 'U'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function AdminUsers() {
  const { getRole } = useUser()
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [accessUser, setAccessUser] = useState<AdminUserRow | null>(null)
  const [accessLoading, setAccessLoading] = useState(false)

  const canDeleteUsers = getRole() === 'super_admin'
  const expectedUsername = selectedUser?.username ?? ''
  const isConfirmMatch = confirmUsername === expectedUsername
  const canToggleAccess = (user: AdminUserRow) =>
    ['teacher', 'student', 'institution_admin'].includes(user.role ?? '')

  useEffect(() => {
    async function loadUsers() {
      try {
        const rows = await listAdminUsers()
        setUsers(rows)
      } catch (error) {
        toast.error('Failed to load users', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        })
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
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

  function openDeleteDialog(user: AdminUserRow) {
    if (!user.username) {
      toast.error('Cannot delete user without username')
      return
    }

    setSelectedUser(user)
    setConfirmUsername('')
    setDialogOpen(true)
  }

  async function handleDeleteUser() {
    if (!selectedUser?.username || !isConfirmMatch) return

    setDeleting(true)
    try {
      const result = await deleteUserCompletely(selectedUser.user_id, selectedUser.username)
      setUsers((prev) => prev.filter((user) => user.user_id !== selectedUser.user_id))
      setDialogOpen(false)
      setSelectedUser(null)
      setConfirmUsername('')

      toast.success('User deleted permanently', {
        description: `${result.deleted_username} was deleted from auth and profile tables.`,
      })
    } catch (error) {
      toast.error('Failed to delete user', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      })
    } finally {
      setDeleting(false)
    }
  }

  function openAccessDialog(user: AdminUserRow) {
    setAccessUser(user)
    setAccessDialogOpen(true)
  }

  async function handleToggleAccess() {
    if (!accessUser) return

    setAccessLoading(true)
    try {
      const nextActive = !accessUser.is_active
      const result = await setUserActiveStatus(accessUser.user_id, nextActive)

      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === accessUser.user_id ? { ...user, is_active: result.is_active } : user,
        ),
      )

      setAccessDialogOpen(false)
      setAccessUser(null)

      toast.success(result.is_active ? 'User activated' : 'User deactivated', {
        description: `${accessUser.username ?? 'User'} can ${
          result.is_active ? 'log in again' : 'no longer log in'
        }.`,
      })
    } catch (error) {
      toast.error('Failed to change user access', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      })
    } finally {
      setAccessLoading(false)
    }
  }

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-8 px-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-bottom-3">
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-center">
            <p className="text-muted-foreground text-sm">No users found.</p>
          </div>
        ) : (
          <div className="rounded-lg border animate-in fade-in-0 slide-in-from-bottom-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access</TableHead>
                  {canDeleteUsers && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow
                    key={user.user_id}
                    className="animate-in fade-in-0 slide-in-from-bottom-2"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar_url || undefined}
                            alt={user.display_name || user.username || 'User avatar'}
                          />
                          <AvatarFallback className="text-xs">
                            {user.avatar_url ? (
                              initialsFromName(user.display_name, user.username)
                            ) : (
                              <Logo
                                showText={false}
                                className="h-4 w-4"
                              />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.display_name || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || '—'}</TableCell>
                    <TableCell>{user.institution_count}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{user.username || '—'}</TableCell>
                    <TableCell>{user.role || '—'}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <span className="text-green-700">Active</span>
                      ) : (
                        <span className="text-red-600">Deactivated</span>
                      )}
                    </TableCell>
                    {canDeleteUsers && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAccessDialog(user)}
                            disabled={!canToggleAccess(user)}
                          >
                            {user.is_active ? (
                              <>
                                <UserX className="mr-1 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-1 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            disabled={!user.username}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDialogOpen(open)
            if (!open) {
              setSelectedUser(null)
              setConfirmUsername('')
            }
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user permanently?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently delete the user from profiles and
              auth.users. Stored files are kept and can be cleaned up manually later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Type username <span className="font-semibold">{expectedUsername || '—'}</span> to
              confirm.
            </p>
            <Input
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder="Type exact username to confirm"
              aria-label="Confirm username"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <HoldToDeleteButton
              holdDuration={1500}
              onDelete={handleDeleteUser}
              disabled={!isConfirmMatch || deleting || !selectedUser?.username}
            >
              {deleting ? 'Deleting...' : 'Hold to delete permanently'}
            </HoldToDeleteButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={accessDialogOpen}
        onOpenChange={(open) => {
          if (!accessLoading) {
            setAccessDialogOpen(open)
            if (!open) setAccessUser(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accessUser?.is_active ? 'Deactivate this user?' : 'Activate this user?'}
            </DialogTitle>
            <DialogDescription>
              {accessUser?.is_active
                ? 'User will not be able to log in until reactivated by super admin.'
                : 'User will be able to log in again after activation.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccessDialogOpen(false)}
              disabled={accessLoading}
            >
              Cancel
            </Button>
            <Button
              variant={accessUser?.is_active ? 'destructive' : 'default'}
              onClick={handleToggleAccess}
              disabled={accessLoading || !accessUser}
            >
              {accessLoading
                ? 'Saving...'
                : accessUser?.is_active
                  ? 'Deactivate user'
                  : 'Activate user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminWorkspaceShell>
  )
}
