import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DoorOpen, UserMinus, UsersRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Logo } from '@/components/ui/logo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  SkeletonLoaderAvatarsUserInfo,
  SkeletonLoaderCard,
  SkeletonLoaderTextParagraphs,
} from '@/components/shared'

import { AssignClassGroupDialog } from '../components/AssignClassGroupDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { InstitutionUsersEmptyState } from '../components/InstitutionUsersEmptyState'
import { RemoveFromInstitutionDialog } from '../components/RemoveFromInstitutionDialog'
import { WithdrawFromClassDialog } from '../components/WithdrawFromClassDialog'
import type {
  InstitutionUserRow,
  InstitutionUsersDialogState,
} from '../types/institution-users.types'
import { buildInitialsFromDisplayName, institutionUserRoleTranslationKey } from '../utils'

/** Replace with institution user list from the API when wired. */
const INSTITUTION_USER_ROWS: readonly InstitutionUserRow[] = []

const InstitutionUsers = () => {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleFilter = searchParams.get('role')
  const [userActionsPopoverId, setUserActionsPopoverId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<InstitutionUsersDialogState>(null)
  const [removeLoading, setRemoveLoading] = useState(false)

  const isLoading = false

  const users = useMemo(() => {
    if (!roleFilter) return INSTITUTION_USER_ROWS
    return INSTITUTION_USER_ROWS.filter((u) => u.role === roleFilter)
  }, [roleFilter])

  const totalUsers = users.length
  const totalAll = INSTITUTION_USER_ROWS.length

  const assignDialogOpen = dialog?.mode === 'assignClass'
  const withdrawDialogOpen = dialog?.mode === 'withdrawFromClass'
  const removeDialogOpen = dialog?.mode === 'removeFromInstitution'

  const withdrawMembershipRole = dialog?.mode === 'withdrawFromClass' ? dialog.user.role : ''

  const removeMembershipRole = dialog?.mode === 'removeFromInstitution' ? dialog.user.role : ''

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (dialog?.mode === 'removeFromInstitution' && removeLoading) return
      setDialog(null)
    }
  }

  const openAssignDialog = (user: InstitutionUserRow) => {
    setUserActionsPopoverId(null)
    setDialog({ mode: 'assignClass', user })
  }

  const openWithdrawFromClassDialog = (user: InstitutionUserRow) => {
    setUserActionsPopoverId(null)
    setDialog({ mode: 'withdrawFromClass', user })
  }

  const openRemoveFromInstitutionDialog = (user: InstitutionUserRow) => {
    setUserActionsPopoverId(null)
    setDialog({ mode: 'removeFromInstitution', user })
  }

  function handleConfirmAssignClassGroup() {
    setDialog(null)
  }

  function handleConfirmWithdrawFromClass() {
    setDialog(null)
  }

  async function handleConfirmRemoveFromInstitution() {
    const target = dialog?.mode === 'removeFromInstitution' ? dialog.user : null
    if (!target) return

    setRemoveLoading(true)
    try {
      // TODO: call membership API — set left_institution_at for this institution
      await new Promise((r) => setTimeout(r, 350))
      toast.success(t('users.toasts.removeFromInstitutionSuccess'), {
        description: t('users.toasts.removeFromInstitutionSuccessDescription', {
          name: target.display_name?.trim() || target.username?.trim() || '—',
        }),
      })
      setDialog(null)
    } finally {
      setRemoveLoading(false)
    }
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-10 px-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t('users.pageTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('users.subtitle')}</p>
            {roleFilter ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {t('users.roleFilterNotice', {
                  role: t(institutionUserRoleTranslationKey(roleFilter)),
                })}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="darkblue"
            className="shrink-0 self-start"
            onClick={() => navigate('/institution_admin/users/invite-users')}
          >
            {t('users.inviteUsersCta')}
          </Button>
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
          <InstitutionUsersEmptyState />
        ) : (
          <div className="overflow-hidden rounded-lg border animate-in fade-in-0 slide-in-from-bottom-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">
                {t('users.totalHeading')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums text-gray-900">
                  {totalUsers}
                </span>
                {roleFilter && totalUsers !== totalAll ? (
                  <span className="text-xs text-muted-foreground">
                    {t('users.totalOfInstitution', { total: totalAll })}
                  </span>
                ) : null}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.table.user')}</TableHead>
                  <TableHead>{t('users.table.email')}</TableHead>
                  <TableHead>{t('users.table.username')}</TableHead>
                  <TableHead>{t('users.table.role')}</TableHead>
                  <TableHead>{t('users.table.access')}</TableHead>
                  <TableHead className="text-right">{t('users.table.actions')}</TableHead>
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
                              buildInitialsFromDisplayName(user.display_name, user.username)
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
                    <TableCell className="max-w-[180px] truncate">{user.username || '—'}</TableCell>
                    <TableCell>{t(institutionUserRoleTranslationKey(user.role))}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="outline">{t('users.access.active')}</Badge>
                      ) : (
                        <Badge variant="orange">{t('users.access.deactivated')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Popover
                        open={userActionsPopoverId === user.user_id}
                        onOpenChange={(open) => setUserActionsPopoverId(open ? user.user_id : null)}
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
                          className="w-64 p-2"
                        >
                          <div className="flex flex-col gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start font-normal"
                              onClick={() => openAssignDialog(user)}
                            >
                              <UsersRound
                                className="size-4 shrink-0"
                                aria-hidden
                              />
                              {t('users.actions.assignClassGroup')}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start font-normal"
                              onClick={() => openWithdrawFromClassDialog(user)}
                            >
                              <DoorOpen
                                className="size-4 shrink-0"
                                aria-hidden
                              />
                              {t('users.actions.withdrawFromClass')}
                            </Button>
                            <Button
                              type="button"
                              variant="delete"
                              size="sm"
                              className="w-full justify-start font-normal"
                              onClick={() => openRemoveFromInstitutionDialog(user)}
                            >
                              <UserMinus
                                className="size-4 shrink-0"
                                aria-hidden
                              />
                              {t('users.actions.removeFromInstitution')}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AssignClassGroupDialog
        open={assignDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onConfirmAssign={handleConfirmAssignClassGroup}
      />

      <WithdrawFromClassDialog
        open={withdrawDialogOpen}
        membershipRole={withdrawMembershipRole}
        onOpenChange={handleDialogOpenChange}
        onConfirmWithdraw={handleConfirmWithdrawFromClass}
      />

      <RemoveFromInstitutionDialog
        open={removeDialogOpen}
        membershipRole={removeMembershipRole}
        isRemoving={removeLoading}
        onOpenChange={handleDialogOpenChange}
        onConfirmRemove={handleConfirmRemoveFromInstitution}
      />
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionUsers }
