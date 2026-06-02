import { useTranslation } from 'react-i18next'
import { RefreshCcw, TriangleAlert } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Text } from '@/components/ui/text'

import { InstitutionAdminWorkspaceShell } from '../components/InstitutionAdminWorkspaceShell'
import { useInstitutionAuditEvents } from '../hooks/useInstitutionAuditEvents'

const EVENT_BADGE_VARIANTS = ['secondary', 'outline', 'violet', 'indigo', 'blue', 'cyan'] as const

function badgeVariantForEventType(eventType: string) {
  let hash = 0
  for (let index = 0; index < eventType.length; index++) {
    hash = (hash + eventType.charCodeAt(index) * 31) % 1_000_000
  }
  return EVENT_BADGE_VARIANTS[Math.abs(hash) % EVENT_BADGE_VARIANTS.length]!
}

function formatOccurredAt(iso: string, locale: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale || 'en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatJson(value: unknown): string {
  if (value === null || value === undefined) return '—'
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const InstitutionAuditLogs = () => {
  const { t, i18n } = useTranslation('features.institution-admin')
  const { events, actorEmailByUserId, isLoading, error, refresh } = useInstitutionAuditEvents()

  return (
    <InstitutionAdminWorkspaceShell>
      <div className="mx-auto flex w-full max-w-[min(100%,1600px)] flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <Text
              as="h1"
              variant="h3"
              className="font-semibold tracking-tight text-foreground"
            >
              {t('auditLogs.title')}
            </Text>
            <Text
              as="p"
              variant="small"
              color="muted"
              className="max-w-2xl text-pretty"
            >
              {t('auditLogs.subtitle')}
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
        ) : null}

        {!isLoading && !error && events.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>{t('auditLogs.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('auditLogs.empty')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {!isLoading && !error && events.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('auditLogs.table.occurredAt')}</TableHead>
                  <TableHead>{t('auditLogs.table.actor')}</TableHead>
                  <TableHead>{t('auditLogs.table.eventType')}</TableHead>
                  <TableHead>{t('auditLogs.table.subjectType')}</TableHead>
                  <TableHead>{t('auditLogs.table.subjectId')}</TableHead>
                  <TableHead>{t('auditLogs.table.payload')}</TableHead>
                  <TableHead>{t('auditLogs.table.metadata')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const actorEmail = event.actor_user_id
                    ? actorEmailByUserId.get(event.actor_user_id)
                    : null
                  return (
                    <TableRow key={event.id}>
                      <TableCell>{formatOccurredAt(event.occurred_at, i18n.language)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {actorEmail ?? event.actor_user_id ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={badgeVariantForEventType(event.event_type)}
                          className="max-w-56 whitespace-normal font-normal"
                        >
                          {event.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.subject_type ?? '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{event.subject_id ?? '—'}</TableCell>
                      <TableCell className="max-w-[360px] truncate font-mono text-xs">
                        {formatJson(event.payload)}
                      </TableCell>
                      <TableCell className="max-w-[360px] truncate font-mono text-xs">
                        {formatJson(event.metadata)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </div>
    </InstitutionAdminWorkspaceShell>
  )
}

export { InstitutionAuditLogs }
