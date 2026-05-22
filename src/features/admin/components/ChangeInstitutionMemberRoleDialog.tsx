import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HoldConfirmButton } from '@/components/ui/HoldConfirmButton'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'

import {
  adminSetInstitutionMemberRole,
  fetchInstitutionAdminMember,
  INSTITUTION_MEMBER_ROLES,
  type InstitutionAdminMember,
  type InstitutionMemberRole,
} from '../api/institutionMemberApi'
import type { Institution } from '../types/institution.types'

type ChangeInstitutionMemberRoleDialogProps = {
  institution: Institution | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ChangeInstitutionMemberRoleDialog = ({
  institution,
  open,
  onOpenChange,
}: ChangeInstitutionMemberRoleDialogProps) => {
  const { t } = useTranslation('features.admin')
  const [member, setMember] = useState<InstitutionAdminMember | null>(null)
  const [loadingMember, setLoadingMember] = useState(false)
  const [selectedRole, setSelectedRole] = useState<InstitutionMemberRole>('institution_admin')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !institution) {
      setMember(null)
      setSelectedRole('institution_admin')
      return
    }

    let cancelled = false
    setLoadingMember(true)

    fetchInstitutionAdminMember(institution.id)
      .then((admin) => {
        if (cancelled) return
        setMember(admin)
        const current =
          admin?.profileRole &&
          INSTITUTION_MEMBER_ROLES.includes(admin.profileRole as InstitutionMemberRole)
            ? (admin.profileRole as InstitutionMemberRole)
            : 'institution_admin'
        setSelectedRole(current)
      })
      .catch((error) => {
        if (cancelled) return
        setMember(null)
        toast.error(t('institutions.changeRoleDialog.loadError'), {
          description:
            error instanceof Error ? error.message : t('institutions.toasts.unexpectedError'),
        })
      })
      .finally(() => {
        if (!cancelled) setLoadingMember(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, institution, t])

  const handleOpenChange = (next: boolean) => {
    if (!saving) onOpenChange(next)
  }

  const currentRole = member?.profileRole ?? member?.membershipRole ?? null
  const roleUnchanged =
    currentRole !== null && selectedRole === currentRole && member?.membershipRole === selectedRole

  async function handleConfirmRoleChange() {
    if (!institution || !member || roleUnchanged) return

    setSaving(true)
    try {
      await adminSetInstitutionMemberRole(institution.id, member.userId, selectedRole)
      onOpenChange(false)
      toast.success(t('institutions.changeRoleDialog.success'), {
        description: t('institutions.changeRoleDialog.successDescription', {
          email: member.email ?? '—',
          role: t(`institutions.roles.${selectedRole}`),
        }),
      })
    } catch (error) {
      toast.error(t('institutions.changeRoleDialog.error'), {
        description:
          error instanceof Error ? error.message : t('institutions.toasts.unexpectedError'),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('institutions.changeRoleDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('institutions.changeRoleDialog.description', { name: institution?.name ?? '—' })}
          </DialogDescription>
        </DialogHeader>

        {loadingMember ? (
          <div className="flex justify-center py-8">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : !member ? (
          <p className="text-sm text-muted-foreground">
            {t('institutions.changeRoleDialog.noAdmin')}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">
                  {t('institutions.changeRoleDialog.userLabel')}:{' '}
                </span>
                <span className="font-medium">{member.displayName || member.email || '—'}</span>
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t('institutions.changeRoleDialog.emailLabel')}:{' '}
                </span>
                <span className="font-medium">{member.email ?? '—'}</span>
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t('institutions.changeRoleDialog.currentRoleLabel')}:{' '}
                </span>
                <span className="font-medium">
                  {currentRole
                    ? t(`institutions.roles.${currentRole}`, { defaultValue: currentRole })
                    : '—'}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('institutions.changeRoleDialog.newRoleLabel')}</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as InstitutionMemberRole)}
                className="flex flex-col gap-2"
              >
                {INSTITUTION_MEMBER_ROLES.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2"
                  >
                    <RadioGroupItem
                      value={role}
                      id={`institution-role-${role}`}
                    />
                    <Label
                      htmlFor={`institution-role-${role}`}
                      className="font-normal"
                    >
                      {t(`institutions.roles.${role}`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            {t('institutions.changeRoleDialog.cancel')}
          </Button>
          {saving ? (
            <Button
              type="button"
              variant="darkblue"
              disabled
              className="min-w-[10rem]"
            >
              <Spinner
                variant="white"
                size="sm"
                speed={1750}
              />
            </Button>
          ) : (
            <HoldConfirmButton
              type="button"
              variant="darkblue"
              holdDuration={2000}
              disabled={!member || roleUnchanged || loadingMember}
              onConfirm={handleConfirmRoleChange}
            >
              {t('institutions.changeRoleDialog.confirmHold')}
            </HoldConfirmButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ChangeInstitutionMemberRoleDialog }
