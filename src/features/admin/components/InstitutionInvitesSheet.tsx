import { useTranslation } from 'react-i18next'
import { Check, XCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FieldInput } from '@/components/ui/field-input'
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
                <FieldInput
                  id="invite-expires-at"
                  label={t('institutionInvites.table.expiresAt')}
                  value={expiresFormatted}
                  onValueChange={() => {}}
                  disabled
                  inputClassName="bg-muted"
                />

                <FieldInput
                  id="invite-invited-by"
                  label={t('institutionInvites.table.invitedBy')}
                  value={inviterDisplay}
                  onValueChange={() => {}}
                  disabled
                  inputClassName="bg-muted"
                />

                <Alert variant={isAccepted ? 'blue' : 'orange'}>
                  {isAccepted ? (
                    <Check
                      className="size-4"
                      aria-hidden
                    />
                  ) : (
                    <XCircle
                      className="size-4"
                      aria-hidden
                    />
                  )}
                  <AlertTitle>
                    {isAccepted
                      ? t('institutionInvites.acceptedYes')
                      : t('institutionInvites.acceptedNo')}
                  </AlertTitle>
                  <AlertDescription>
                    {isAccepted ? (
                      acceptedUserDisplay !== '—' ? (
                        <span className="font-mono text-xs">{acceptedUserDisplay}</span>
                      ) : (
                        <span>{t('institutionInvites.sheet.acceptedNoUserId')}</span>
                      )
                    ) : (
                      t('institutionInvites.sheet.pendingInviteHint')
                    )}
                  </AlertDescription>
                </Alert>
              </form>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
