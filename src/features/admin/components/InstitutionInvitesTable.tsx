import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Mail, MailPlus } from 'lucide-react'
import { toast } from 'sonner'
import type { VariantProps } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { InstitutionInvitesSheet } from './InstitutionInvitesSheet'
import type { InstitutionInvite } from '../types/institutionInvites.types'
import { badgeVariants } from '@/components/ui/badge-variants'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

function membershipRoleVariant(role: string): BadgeVariant {
  switch (role) {
    case 'institution_admin':
      return 'violet'
    case 'teacher':
      return 'blue'
    case 'student':
      return 'cyan'
    default:
      return 'secondary'
  }
}

type InstitutionInvitesTableProps = {
  invites: readonly InstitutionInvite[]
  inviterEmailByUserId: ReadonlyMap<string, string>
  onResend?: (institutionId: string) => Promise<void>
}

export function InstitutionInvitesTable({
  invites,
  inviterEmailByUserId,
  onResend,
}: InstitutionInvitesTableProps) {
  const { t } = useTranslation('features.admin')
  const [selectedInvite, setSelectedInvite] = useState<InstitutionInvite | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const sheetOpen = selectedInvite !== null

  async function handleResendInvite(e: React.MouseEvent, institutionId: string) {
    e.stopPropagation()
    if (!onResend) return

    setResendingId(institutionId)
    try {
      await onResend(institutionId)
      toast.success(t('institutionInvites.resendSuccess', { defaultValue: 'Invite email sent' }))
    } catch (e) {
      toast.error(
        t('institutionInvites.resendError', { defaultValue: 'Failed to resend invite' }),
        {
          description: e instanceof Error ? e.message : undefined,
        },
      )
    } finally {
      setResendingId(null)
    }
  }

  function handleOpenDetails(invite: InstitutionInvite) {
    setSelectedInvite(invite)
  }

  function handleSheetOpenChange(open: boolean) {
    if (!open) {
      setSelectedInvite(null)
    }
  }

  if (invites.length === 0) {
    return (
      <div className="rounded-md border border-dashed">
        <Empty className="min-h-[280px] border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail aria-hidden />
            </EmptyMedia>
            <EmptyTitle>{t('institutionInvites.emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('institutionInvites.emptyDescription')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('institutionInvites.table.email')}</TableHead>
              <TableHead>{t('institutionInvites.table.membershipRole')}</TableHead>
              <TableHead className="text-right">{t('institutionInvites.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-[200px] truncate font-medium">{row.email}</TableCell>
                <TableCell>
                  <Badge variant={membershipRoleVariant(row.membershipRole)}>
                    {row.membershipRole}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!row.acceptedAtIso && onResend && (
                      <Button
                        type="button"
                        variant="darkblue"
                        size="sm"
                        onClick={(e) => void handleResendInvite(e, row.institutionId)}
                        disabled={resendingId === row.institutionId}
                      >
                        <MailPlus className="size-4" />
                        {resendingId === row.institutionId
                          ? t('institutionInvites.table.sending')
                          : t('institutionInvites.table.resend')}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="darkblue"
                      size="sm"
                      onClick={() => handleOpenDetails(row)}
                    >
                      {t('institutionInvites.table.openDetails')}
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InstitutionInvitesSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        invite={selectedInvite}
        inviterEmailByUserId={inviterEmailByUserId}
      />
    </>
  )
}
