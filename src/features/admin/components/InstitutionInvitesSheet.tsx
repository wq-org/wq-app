import { useTranslation } from 'react-i18next'
import { Check, XCircle } from 'lucide-react'

import { FieldInput } from '@/components/ui/field-input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { InstitutionInvite } from '../types/institutionInvites.types'
import { formatAuditOccurredAt } from '../utils/formatAuditOccurredAt'
import { resolveActorEmail } from '../utils/resolveActorEmail'

type InstitutionInvitesSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invite: InstitutionInvite | null
  inviterEmailByUserId: ReadonlyMap<string, string>
}

export function InstitutionInvitesSheet({
  open,
  onOpenChange,
  invite,
  inviterEmailByUserId,
}: InstitutionInvitesSheetProps) {
  const { t, i18n } = useTranslation('features.admin')

  const inviter = invite ? resolveActorEmail(invite.invitedByUserId, inviterEmailByUserId) : null
  const inviterDisplay = !inviter
    ? '—'
    : inviter.kind === 'email'
      ? inviter.email
      : inviter.kind === 'id'
        ? inviter.id
        : '—'
  const isAccepted = invite != null && invite.acceptedAtIso != null && invite.acceptedAtIso !== ''
  const expiresFormatted = invite ? formatAuditOccurredAt(invite.expiresAtIso, i18n.language) : '—'
  const acceptedUserDisplay = invite?.acceptedUserId?.trim() ? invite.acceptedUserId : '—'

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md"
      >
        {invite ? (
          <>
            <SheetHeader className="border-b border-border pb-4 text-left">
              <SheetTitle>{t('institutionInvites.sheet.title')}</SheetTitle>
              <SheetDescription className="text-balance">{invite.email}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-4 pb-6 pt-4">
              <p className="text-center text-muted-foreground text-sm text-balance sm:text-left">
                {t('institutionInvites.sheet.subtitle')}
              </p>

              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="flex flex-col gap-2">
                  <Label>{t('institutionInvites.table.expiresAt')}</Label>
                  <FieldInput
                    id="invite-expires-at"
                    label={t('institutionInvites.table.expiresAt')}
                    value={expiresFormatted}
                    onValueChange={() => {}}
                    disabled
                    inputClassName="bg-muted"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{t('institutionInvites.table.invitedBy')}</Label>
                  <FieldInput
                    id="invite-invited-by"
                    label={t('institutionInvites.table.invitedBy')}
                    value={inviterDisplay}
                    onValueChange={() => {}}
                    disabled
                    inputClassName="bg-muted"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{t('institutionInvites.table.accepted')}</Label>
                  <div className="flex min-h-10 items-center gap-2 rounded-md border border-input bg-muted px-3 py-2">
                    <div
                      role="img"
                      className={`inline-flex shrink-0 ${isAccepted ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}
                      aria-label={
                        isAccepted
                          ? t('institutionInvites.acceptedYes')
                          : t('institutionInvites.acceptedNo')
                      }
                    >
                      {isAccepted ? (
                        <Check
                          className="size-5"
                          aria-hidden
                        />
                      ) : (
                        <XCircle
                          className="size-5"
                          aria-hidden
                        />
                      )}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {isAccepted
                        ? t('institutionInvites.acceptedYes')
                        : t('institutionInvites.acceptedNo')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{t('institutionInvites.table.acceptedUserId')}</Label>
                  <FieldInput
                    id="invite-accepted-user-id"
                    label={t('institutionInvites.table.acceptedUserId')}
                    value={acceptedUserDisplay}
                    onValueChange={() => {}}
                    disabled
                    inputClassName="bg-muted font-mono text-xs"
                  />
                </div>
              </form>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
