import { useTranslation } from 'react-i18next'
import { RefreshCcw, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'

import { AdminAuditLogTable } from '../components/AdminAuditLogTable'
import { AdminWorkspaceShell } from '../components/AdminWorkspaceShell'
import { useAuditEvents } from '../hooks/useAuditEvents'

const AdminAuditLogs = () => {
  const { t } = useTranslation('features.admin')
  const { events, actorEmailByUserId, isLoading, error, refresh } = useAuditEvents()

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
              {t('auditLogs.pageTitle')}
            </Text>
            <Text
              as="p"
              variant="small"
              color="muted"
              className="max-w-2xl text-pretty"
            >
              {t('auditLogs.pageDescription')}
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
            {t('auditLogs.refresh')}
          </Button>
        </div>

        {error && !isLoading ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TriangleAlert aria-hidden />
              </EmptyMedia>
              <EmptyTitle>{t('auditLogs.errorTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('auditLogs.errorDescription', { message: error })}
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
          <AdminAuditLogTable
            events={events}
            actorEmailByUserId={actorEmailByUserId}
          />
        ) : null}
      </div>
    </AdminWorkspaceShell>
  )
}

export { AdminAuditLogs }
