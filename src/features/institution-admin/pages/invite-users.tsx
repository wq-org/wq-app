import { useState } from 'react'

import { ClearableInput } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { Mail } from 'lucide-react'

const InstitutionInviteUsers = () => {
  const { t } = useTranslation('features.institution-admin')
  const [email, setEmail] = useState('')

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="flex flex-col gap-6 py-10 px-4 animate-in fade-in-0 slide-in-from-bottom-4">
        <div className="flex flex-col gap-1 animate-in fade-in-0 slide-in-from-bottom-3">
          <h1 className="text-2xl font-semibold text-gray-900">{t('inviteUsers.pageTitle')}</h1>
          <p className="text-sm text-muted-foreground max-w-xl">{t('inviteUsers.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3 max-w-xl">
          <ClearableInput
            className="flex-1 pb-0"
            label={t('inviteUsers.emailLabel')}
            placeholder={t('inviteUsers.emailPlaceholder')}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onValueChange={setEmail}
          />
          <Button
            type="button"
            variant="darkblue"
            className="h-12 shrink-0 sm:min-w-[120px]"
            disabled={!email.trim()}
          >
            {t('inviteUsers.submitButton')}

            <Mail />
          </Button>
        </div>
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionInviteUsers }
