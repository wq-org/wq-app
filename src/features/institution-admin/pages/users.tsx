import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DoorOpen, Mail, UserMinus, UserRoundPlus, UsersRound } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUser } from '@/contexts/user'

import { resendTeacherStudentInviteEmail } from '../api/institutionUserInvitesApi'
import { useInstitutionUsers } from '../hooks/useInstitutionUsers'
import { AssignClassGroupDialog } from '../components/AssignClassGroupDialog'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { InstitutionUsersEmptyState } from '../components/InstitutionUsersEmptyState'
import { RemoveFromInstitutionDialog } from '../components/RemoveFromInstitutionDialog'
import { WithdrawFromClassDialog } from '../components/WithdrawFromClassDialog'
import type {
  InstitutionDirectoryRow,
  InstitutionInviteDirectoryRow,
  InstitutionMemberDirectoryRow,
  InstitutionUsersDialogState,
  InstitutionUserRow,
  MembershipStatusDb,
} from '../types/institution-users.types'
import { directoryMemberToUserRow } from '../types/institution-users.types'

import { buildInitialsFromDisplayName, institutionUserRoleTranslationKey } from '../utils'

function membershipStatusTranslationKey(status: MembershipStatusDb): string {
  return `users.membershipStatus.${status}`
}

/** Institution admins must not manage peer admins from this UI; super_admin bypasses for ops. */
function areMemberRowActionsDisabled(
  row: InstitutionMemberDirectoryRow,
  viewerRole: string | null,
): boolean {
  if (viewerRole === 'super_admin') return false
  return row.membership_role === 'institution_admin'
}

const InstitutionUsers = () => {
  const { t } = useTranslation('features.institution-admin')
  const navigate = useNavigate()
  const { profile, getRole } = useUser()
  const viewerRole = getRole()
  const institutionId = profile?.institution?.id ?? null
  const institutionName = profile?.institution?.name ?? null

  const [searchParams] = useSearchParams()
  const roleFilter = searchParams.get('role')
  const [userActionsPopoverId, setUserActionsPopoverId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<InstitutionUsersDialogState>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [resendToken, setResendToken] = useState<string | null>(null)

  const { users: directory, isLoading, error: loadError } = useInstitutionUsers(institutionId)

  const filteredDirectory = useMemo(() => {
    if (!roleFilter) return directory
    return directory.filter((r) => r.membership_role === roleFilter)
  }, [directory, roleFilter])

  const totalUsers = filteredDirectory.length
  const totalAll = directory.length

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

  async function handleResendInvite(row: InstitutionInviteDirectoryRow) {
    setResendToken(row.invite_token)
    try {
      await resendTeacherStudentInviteEmail({
        inviteToken: row.invite_token,
        recipientEmail: row.email,
        institutionName,
      })
      toast.success(t('users.toasts.resendInviteSuccess'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('users.toasts.resendInviteError'))
    } finally {
      setResendToken(null)
    }
  }

  function renderStatusCell(row: InstitutionDirectoryRow) {
    if (row.rowKind === 'invite') {
      return <Badge variant="secondary">{t('users.inviteStatus.pendingEmail')}</Badge>
    }
    return (
      <Badge variant="outline">{t(membershipStatusTranslationKey(row.membership_status))}</Badge>
    )
  }

  function rowKey(row: InstitutionDirectoryRow): string {
    return row.rowKind === 'member' ? `m:${row.user_id}` : `i:${row.invite_token}`
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-10 px-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('users.pageTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('users.subtitle')}</p>
            {roleFilter ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {t('users.roleFilterNotice', {
                  role: t(institutionUserRoleTranslationKey(roleFilter)),
                })}
              </p>
            ) : null}
            {loadError ? <p className="mt-2 text-sm text-destructive">{loadError}</p> : null}
          </div>
          <Button
            type="button"
            variant="darkblue"
            className="shrink-0 self-start"
            onClick={() => navigate('/institution_admin/users/invite-users')}
          >
            <UserRoundPlus />
            {t('users.inviteUsersCta')}
          </Button>
        </div>

        {!institutionId ? (
          <p className="text-sm text-muted-foreground">{t('users.missingInstitutionContext')}</p>
        ) : isLoading ? (
          <div className="min-h-[300px] animate-in fade-in-0 slide-in-from-bottom-2 rounded-lg border p-6">
            <div className="mt-6 flex items-center justify-center">
              <Spinner
                variant="gray"
                size="sm"
                speed={1750}
              />
            </div>
          </div>
        ) : filteredDirectory.length === 0 ? (
          <InstitutionUsersEmptyState />
        ) : (
          <div className="overflow-hidden rounded-lg border animate-in fade-in-0 slide-in-from-bottom-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">
                {t('users.totalHeading')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">{totalUsers}</span>
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
                  <TableHead>{t('users.table.status')}</TableHead>
                  <TableHead className="text-right">{t('users.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDirectory.map((row) => (
                  <TableRow
                    key={rowKey(row)}
                    className="animate-in fade-in-0 slide-in-from-bottom-2"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {row.rowKind === 'member' ? (
                            <>
                              <AvatarImage
                                src={row.avatar_url || undefined}
                                alt={row.display_name || row.username || 'User avatar'}
                              />
                              <AvatarFallback className="text-xs">
                                {row.avatar_url ? (
                                  buildInitialsFromDisplayName(row.display_name, row.username)
                                ) : (
                                  <Logo
                                    showText={false}
                                    className="h-4 w-4"
                                  />
                                )}
                              </AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback className="text-xs">
                              <Mail
                                className="size-4"
                                aria-hidden
                              />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">
                          {row.rowKind === 'member' ? row.display_name || '—' : '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{row.email || '—'}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {row.rowKind === 'member' ? row.username || '—' : '—'}
                    </TableCell>
                    <TableCell>
                      {t(institutionUserRoleTranslationKey(row.membership_role))}
                    </TableCell>
                    <TableCell>{renderStatusCell(row)}</TableCell>
                    <TableCell className="text-right">
                      {row.rowKind === 'invite' ? (
                        <Popover
                          open={userActionsPopoverId === row.invite_token}
                          onOpenChange={(open) =>
                            setUserActionsPopoverId(open ? row.invite_token : null)
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
                            className="w-64 p-2"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start font-normal"
                              disabled={resendToken === row.invite_token}
                              onClick={() => void handleResendInvite(row)}
                            >
                              <Mail
                                className="size-4 shrink-0"
                                aria-hidden
                              />
                              {t('users.actions.resendInvitation')}
                            </Button>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <MemberRowActions
                          row={row}
                          viewerRole={viewerRole}
                          popoverOpen={userActionsPopoverId === row.user_id}
                          onPopoverOpenChange={(open) =>
                            setUserActionsPopoverId(open ? row.user_id : null)
                          }
                          onAssign={() => openAssignDialog(directoryMemberToUserRow(row))}
                          onWithdraw={() =>
                            openWithdrawFromClassDialog(directoryMemberToUserRow(row))
                          }
                          onRemove={() =>
                            openRemoveFromInstitutionDialog(directoryMemberToUserRow(row))
                          }
                        />
                      )}
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

type MemberRowActionsProps = {
  row: InstitutionMemberDirectoryRow
  viewerRole: string | null
  popoverOpen: boolean
  onPopoverOpenChange: (open: boolean) => void
  onAssign: () => void
  onWithdraw: () => void
  onRemove: () => void
}

function MemberRowActions({
  row,
  viewerRole,
  popoverOpen,
  onPopoverOpenChange,
  onAssign,
  onWithdraw,
  onRemove,
}: MemberRowActionsProps) {
  const { t } = useTranslation('features.institution-admin')
  const peerActionsLocked = areMemberRowActionsDisabled(row, viewerRole)

  if (peerActionsLocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-not-allowed">
            <Button
              type="button"
              variant="darkblue"
              size="sm"
              disabled
            >
              {t('users.actions.edit')}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="left">
          {t('users.actions.disabledPeerInstitutionAdmin')}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Popover
      open={popoverOpen}
      onOpenChange={onPopoverOpenChange}
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
            onClick={onAssign}
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
            onClick={onWithdraw}
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
            onClick={onRemove}
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
  )
}

export { InstitutionUsers }
