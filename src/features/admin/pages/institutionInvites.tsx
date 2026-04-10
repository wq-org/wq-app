import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCcw, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { InstitutionInvitesTable } from '../components/InstitutionInvitesTable'
import { useInstitutionInvites } from '../hooks/useInstitutionInvites'

export function AdminInstitutionInvites() {
  const { t } = useTranslation('features.admin')
  const { invites, inviterEmailByUserId, isLoading, error, refresh } = useInstitutionInvites()

  useEffect(() => {
    if (error) {
      toast.error(t('institutionInvites.loadError'), { description: error })
    }
  }, [error, t])

  return (
    <AdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-[min(100%,1600px)] flex-col gap-6 py-8 px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <Text
              as="h1"
              variant="h3"
              className="font-semibold tracking-tight text-foreground"
            >
              {t('institutionInvites.pageTitle')}
            </Text>
            <Text
              as="p"
              variant="small"
              color="muted"
              className="max-w-2xl text-pretty"
            >
              {t('institutionInvites.pageDescription')}
            </Text>
          </div>
          <Button
            type="button"
            variant="darkblue"
            size="sm"
            className="gap-2"
            onClick={() => void refresh()}
            disabled={isLoading}
          >
            <RefreshCcw className="size-4" />
            {t('institutionInvites.refresh')}
          </Button>
        </div>

        {error && !isLoading ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlert aria-hidden />
              </EmptyMedia>
              <EmptyTitle>{t('institutionInvites.errorTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('institutionInvites.errorDescription', { message: error })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : !error ? (
          <InstitutionInvitesTable
            invites={invites}
            inviterEmailByUserId={inviterEmailByUserId}
          />
        ) : null}
      </div>
    </AdminWorkspaceShell>
  )
}
