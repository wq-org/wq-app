import { useState } from 'react'
import { FileText, Mail, QrCode, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

import { InvitePerEmailStepper } from '../components/InvitePerEmailStepper'
import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'

type InviteMethod = 'email' | 'file' | 'qr'

type WizardPhase = 'chooseMethod' | 'emailWizard'

type InviteMethodOption = {
  value: InviteMethod
  icon: LucideIcon
  titleKey: string
  descriptionKey: string
}

const INVITE_METHOD_OPTIONS: readonly InviteMethodOption[] = [
  {
    value: 'email',
    icon: Mail,
    titleKey: 'inviteUsers.methods.email.title',
    descriptionKey: 'inviteUsers.methods.email.description',
  },
  {
    value: 'file',
    icon: FileText,
    titleKey: 'inviteUsers.methods.file.title',
    descriptionKey: 'inviteUsers.methods.file.description',
  },
  {
    value: 'qr',
    icon: QrCode,
    titleKey: 'inviteUsers.methods.qr.title',
    descriptionKey: 'inviteUsers.methods.qr.description',
  },
]

function InstitutionInviteUsers() {
  const { t } = useTranslation('features.institution-admin')
  const [inviteMethod, setInviteMethod] = useState<InviteMethod>('email')
  const [phase, setPhase] = useState<WizardPhase>('chooseMethod')

  const canContinueFromMethodSelection = inviteMethod === 'email'

  function handleContinueFromMethodSelection() {
    if (!canContinueFromMethodSelection) return
    setPhase('emailWizard')
  }

  function handleBackToMethodSelection() {
    setPhase('chooseMethod')
  }

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex max-w-5xl flex-col gap-8 py-10 px-4 animate-in fade-in-0 slide-in-from-bottom-4">
        {phase === 'chooseMethod' ? (
          <>
            <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-3">
              <h1 className="text-2xl font-semibold text-foreground">
                {t('inviteUsers.pageTitle')}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">{t('inviteUsers.subtitle')}</p>
            </div>
            <RadioGroup
              value={inviteMethod}
              onValueChange={(next) => setInviteMethod(next as InviteMethod)}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
            >
              {INVITE_METHOD_OPTIONS.map((option) => {
                const Icon = option.icon
                const id = `invite-method-${option.value}`
                const isSelected = inviteMethod === option.value

                return (
                  <Label
                    key={option.value}
                    htmlFor={id}
                    className="cursor-pointer h-full flex"
                  >
                    <Card
                      className={cn(
                        'h-full w-full gap-0 py-0 shadow-sm transition-[box-shadow,ring-color,background-color]',
                        isSelected
                          ? 'bg-muted/40 ring-2 ring-primary'
                          : 'ring-1 ring-border hover:bg-muted/25',
                      )}
                    >
                      <CardHeader className="gap-4 px-5 py-5 overflow-hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={cn(
                              'flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-primary',
                              isSelected && 'bg-primary/10',
                            )}
                            aria-hidden
                          >
                            <Icon className="size-6" />
                          </div>
                          <RadioGroupItem
                            value={option.value}
                            id={id}
                            className="mt-0.5"
                          />
                        </div>
                        <div className="space-y-2 min-w-0">
                          <CardTitle className="text-base leading-snug">
                            {t(option.titleKey)}
                          </CardTitle>
                          <CardDescription className="text-sm leading-relaxed text-pretty">
                            {t(option.descriptionKey)}
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </Label>
                )
              })}
            </RadioGroup>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="darkblue"
                disabled={!canContinueFromMethodSelection}
                title={
                  canContinueFromMethodSelection ? undefined : t('inviteUsers.continueDisabledHint')
                }
                onClick={handleContinueFromMethodSelection}
              >
                {t('inviteUsers.continueButton')}
              </Button>
            </div>
          </>
        ) : (
          <InvitePerEmailStepper onExit={handleBackToMethodSelection} />
        )}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionInviteUsers }
