import { useState } from 'react'
import { toast } from 'sonner'
import { Trash, UserLock, UserRoundCheck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useUser } from '@/contexts/user'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { HoldToDeleteButton } from '@/components/ui/HoldToDeleteButton'
import { Logo } from '@/components/ui/logo'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  SkeletonLoaderAvatarsUserInfo,
  SkeletonLoaderCard,
  SkeletonLoaderTextParagraphs,
} from '@/components/shared'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { useAdminUsers } from '../hooks/useAdminUsers'
import type { AdminUserRow } from '../api/userApi'

function initialsFromName(name?: string | null, username?: string | null): string {
  const source = name?.trim() || username?.trim() || 'U'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

const AdminUsers = () => {
  const { getRole } = useUser()
  const { t } = useTranslation('features.admin')
  const { users, isLoading, removeUser, toggleUserActive } = useAdminUsers()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [accessUser, setAccessUser] = useState<AdminUserRow | null>(null)
  const [accessLoading, setAccessLoading] = useState(false)
  const [userActionsPopoverId, setUserActionsPopoverId] = useState<string | null>(null)

  const canDeleteUsers = getRole() === 'super_admin'
  const canToggleAccess = (user: AdminUserRow) =>
    ['teacher', 'student', 'institution_admin'].includes(user.role ?? '')
  const expectedUsername = selectedUser?.username ?? ''
  const isConfirmMatch = confirmUsername === expectedUsername

  function openDeleteDialog(user: AdminUserRow) {
    if (!user.username) {
      toast.error(t('users.toasts.noUsernameError'))
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
      const result = await removeUser(selectedUser.user_id, selectedUser.username)
      setDialogOpen(false)
      setSelectedUser(null)
      setConfirmUsername('')
      toast.success(t('users.toasts.deleteSuccess'), {
        description: t('users.toasts.deleteSuccessDescription', {
          username: result.deleted_username,
        }),
      })
    } catch (error) {
      toast.error(t('users.toasts.deleteError'), {
        description: error instanceof Error ? error.message : t('users.toasts.unexpectedError'),
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
      const result = await toggleUserActive(accessUser.user_id, !accessUser.is_active)
      setAccessDialogOpen(false)
      setAccessUser(null)
      toast.success(
        result.is_active ? t('users.toasts.activateSuccess') : t('users.toasts.deactivateSuccess'),
        {
          description: result.is_active
            ? t('users.toasts.activateDescription', { username: accessUser.username ?? 'User' })
            : t('users.toasts.deactivateDescription', { username: accessUser.username ?? 'User' }),
        },
      )
    } catch (error) {
      toast.error(t('users.toasts.accessError'), {
        description: error instanceof Error ? error.message : t('users.toasts.unexpectedError'),
      })
    } finally {
      setAccessLoading(false)
    }
  }

  return (
    <AdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-10 px-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-bottom-3">
          <h1 className="text-2xl font-semibold text-gray-900">{t('users.pageTitle')}</h1>
        </div>

        {isLoading ? (
          <div className="min-h-[300px] animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <SkeletonLoaderAvatarsUserInfo />
              <SkeletonLoaderCard />
              <SkeletonLoaderTextParagraphs />
            </div>
            <div className="mt-6 flex items-center justify-center">
              <Spinner
                variant="gray"
                size="sm"
                speed={1750}
              />
            </div>
          </div>
        ) : users.length === 0 ? (
          <Empty>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('users.empty.title')}</EmptyTitle>
              <EmptyDescription>{t('users.empty.description')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent />
          </Empty>
        ) : (
          <div className="rounded-lg border animate-in fade-in-0 slide-in-from-bottom-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.table.user')}</TableHead>
                  <TableHead>{t('users.table.email')}</TableHead>
                  <TableHead>{t('users.table.institution')}</TableHead>
                  <TableHead>{t('users.table.username')}</TableHead>
                  <TableHead>{t('users.table.role')}</TableHead>
                  <TableHead>{t('users.table.access')}</TableHead>
                  {canDeleteUsers && (
                    <TableHead className="text-right">{t('users.table.actions')}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
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
                        <Badge variant="outline">{t('users.access.active')}</Badge>
                      ) : (
                        <Badge variant="orange">{t('users.access.deactivated')}</Badge>
                      )}
                    </TableCell>
                    {canDeleteUsers && (
                      <TableCell className="text-right">
                        <Popover
                          open={userActionsPopoverId === user.user_id}
                          onOpenChange={(open) =>
                            setUserActionsPopoverId(open ? user.user_id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="darkblue"
                              size="sm"
                            >
                              {t('users.actions.edit')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="w-52 p-2"
                          >
                            <div className="flex flex-col gap-1">
                              {canToggleAccess(user) && user.is_active && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start font-normal"
                                  onClick={() => {
                                    setUserActionsPopoverId(null)
                                    openAccessDialog(user)
                                  }}
                                >
                                  <UserLock
                                    className="size-4 shrink-0"
                                    aria-hidden
                                  />
                                  {t('users.actions.deactivate')}
                                </Button>
                              )}
                              {canToggleAccess(user) && !user.is_active && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start font-normal"
                                  onClick={() => {
                                    setUserActionsPopoverId(null)
                                    openAccessDialog(user)
                                  }}
                                >
                                  <UserRoundCheck
                                    className="size-4 shrink-0"
                                    aria-hidden
                                  />
                                  {t('users.actions.activate')}
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="delete"
                                size="sm"
                                className="w-full justify-start font-normal"
                                disabled={!user.username}
                                onClick={() => {
                                  setUserActionsPopoverId(null)
                                  openDeleteDialog(user)
                                }}
                              >
                                <Trash
                                  className="size-4 shrink-0"
                                  aria-hidden
                                />
                                {t('users.actions.delete')}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
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
            <DialogTitle>{t('users.deleteDialog.title')}</DialogTitle>
            <DialogDescription>{t('users.deleteDialog.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {t('users.deleteDialog.confirmLabel', { username: expectedUsername || '—' })}
            </p>
            <Input
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder={t('users.deleteDialog.confirmPlaceholder')}
              aria-label={t('users.deleteDialog.confirmPlaceholder')}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={deleting}
            >
              {t('users.deleteDialog.cancelButton')}
            </Button>
            <HoldToDeleteButton
              holdDuration={1500}
              onDelete={handleDeleteUser}
              disabled={!isConfirmMatch || deleting || !selectedUser?.username}
            >
              {deleting
                ? t('users.deleteDialog.deletingButton')
                : t('users.deleteDialog.holdButton')}
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
              {accessUser?.is_active
                ? t('users.accessDialog.deactivateTitle')
                : t('users.accessDialog.activateTitle')}
            </DialogTitle>
            <DialogDescription>
              {accessUser?.is_active
                ? t('users.accessDialog.deactivateDescription')
                : t('users.accessDialog.activateDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccessDialogOpen(false)}
              disabled={accessLoading}
            >
              {t('users.accessDialog.cancelButton')}
            </Button>
            <Button
              variant={accessUser?.is_active ? 'delete' : 'darkblue'}
              onClick={handleToggleAccess}
              disabled={accessLoading || !accessUser}
            >
              {accessLoading
                ? t('users.accessDialog.savingButton')
                : accessUser?.is_active
                  ? t('users.accessDialog.deactivateButton')
                  : t('users.accessDialog.activateButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminWorkspaceShell>
  )
}

export { AdminUsers }
