import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollText } from 'lucide-react'

import type { AuditEventRow } from '../api/auditLogsApi'
import { formatAuditOccurredAt } from '../utils/formatAuditOccurredAt'
import { resolveActorEmail } from '../utils/resolveActorEmail'

const EVENT_BADGE_VARIANTS = ['secondary', 'outline', 'violet', 'indigo', 'blue', 'cyan'] as const

function badgeVariantForEventType(eventType: string) {
  let h = 0
  for (let i = 0; i < eventType.length; i++) {
    h = (h + eventType.charCodeAt(i) * 31) % 1_000_000
  }
  const idx = Math.abs(h) % EVENT_BADGE_VARIANTS.length
  return EVENT_BADGE_VARIANTS[idx]!
}

function jsonCell(value: unknown): string {
  if (value === null || value === undefined) return '—'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function formatUuidOrNull(value: string | null): string {
  if (!value) return '—'
  return value
}

const noop = () => {}

type AdminAuditLogTableProps = {
  events: readonly AuditEventRow[]
  actorEmailByUserId: ReadonlyMap<string, string>
}

function AdminAuditLogTable({ events, actorEmailByUserId }: AdminAuditLogTableProps) {
  const { t, i18n } = useTranslation('features.admin')

  if (events.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ScrollText aria-hidden />
          </EmptyMedia>
          <EmptyTitle>{t('auditLogs.emptyTitle')}</EmptyTitle>
          <EmptyDescription>{t('auditLogs.empty')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[200px]">{t('auditLogs.table.occurredAt')}</TableHead>
          <TableHead className="min-w-[180px]">{t('auditLogs.table.actor')}</TableHead>
          <TableHead className="min-w-[160px]">{t('auditLogs.table.eventType')}</TableHead>
          <TableHead className="min-w-[120px]">{t('auditLogs.table.subjectType')}</TableHead>
          <TableHead className="min-w-[260px] font-mono text-xs">
            {t('auditLogs.table.subjectId')}
          </TableHead>
          <TableHead className="min-w-[260px] font-mono text-xs">
            {t('auditLogs.table.institutionId')}
          </TableHead>
          <TableHead className="min-w-[280px] max-w-[320px] whitespace-normal">
            {t('auditLogs.table.payload')}
          </TableHead>
          <TableHead className="min-w-[280px] max-w-[320px] whitespace-normal">
            {t('auditLogs.table.metadata')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((row) => {
          const actor = resolveActorEmail(row.actor_user_id, actorEmailByUserId)
          const payloadStr = jsonCell(row.payload)
          const metadataStr = jsonCell(row.metadata)

          return (
            <TableRow key={row.id}>
              <TableCell className="whitespace-normal align-top text-sm">
                {formatAuditOccurredAt(row.occurred_at, i18n.language)}
              </TableCell>
              <TableCell className="whitespace-normal align-top text-sm">
                {actor.kind === 'empty' ? (
                  '—'
                ) : actor.kind === 'email' ? (
                  actor.email
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">{actor.id}</span>
                )}
              </TableCell>
              <TableCell className="align-top">
                <Badge
                  variant={badgeVariantForEventType(row.event_type)}
                  className="max-w-[240px] whitespace-normal font-normal"
                >
                  {row.event_type}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-normal align-top text-sm">
                {row.subject_type ?? '—'}
              </TableCell>
              <TableCell className="align-top font-mono text-xs text-muted-foreground">
                {formatUuidOrNull(row.subject_id)}
              </TableCell>
              <TableCell className="align-top font-mono text-xs text-muted-foreground">
                {formatUuidOrNull(row.institution_id)}
              </TableCell>
              <TableCell className="max-w-[320px] whitespace-normal align-top p-2">
                <FieldTextarea
                  label={t('auditLogs.table.payload')}
                  value={payloadStr}
                  onValueChange={noop}
                  readOnly
                  rows={4}
                  hideSeparator
                  className="[&_.relative]:my-0 [&_textarea]:min-h-[5rem] [&_textarea]:cursor-default [&_textarea]:text-xs"
                />
              </TableCell>
              <TableCell className="max-w-[320px] whitespace-normal align-top p-2">
                <FieldTextarea
                  label={t('auditLogs.table.metadata')}
                  value={metadataStr}
                  onValueChange={noop}
                  readOnly
                  rows={4}
                  hideSeparator
                  className="[&_.relative]:my-0 [&_textarea]:min-h-[5rem] [&_textarea]:cursor-default [&_textarea]:text-xs"
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export { AdminAuditLogTable }
