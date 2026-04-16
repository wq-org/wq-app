import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { FieldTextarea } from '@/components/ui/field-textarea'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ScrollArea } from '@/components/ui/scroll-area'
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
const PAGE_SIZE = 50

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

function buildPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: Array<number | 'ellipsis'> = [1]
  const left = Math.max(2, currentPage - 1)
  const right = Math.min(totalPages - 1, currentPage + 1)

  if (left > 2) {
    pages.push('ellipsis')
  }

  for (let page = left; page <= right; page++) {
    pages.push(page)
  }

  if (right < totalPages - 1) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)
  return pages
}

const noop = () => {}

type AdminAuditLogTableProps = {
  events: readonly AuditEventRow[]
  actorEmailByUserId: ReadonlyMap<string, string>
}

function AdminAuditLogTable({ events, actorEmailByUserId }: AdminAuditLogTableProps) {
  const { t, i18n } = useTranslation('features.admin')
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const visibleEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return events.slice(startIndex, startIndex + PAGE_SIZE)
  }, [currentPage, events])

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages],
  )

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  const handlePreviousPage = (event: React.MouseEvent) => {
    event.preventDefault()
    handlePageChange(currentPage - 1)
  }

  const handleNextPage = (event: React.MouseEvent) => {
    event.preventDefault()
    handlePageChange(currentPage + 1)
  }

  const handlePageLink = (page: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    handlePageChange(page)
  }

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
    <div className="flex flex-col gap-4">
      <ScrollArea
        className="h-[min(72vh,42rem)] rounded-lg border"
        scrollbars="both"
      >
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-background">
            <TableRow>
              <TableHead className="min-w-[200px] bg-background">
                {t('auditLogs.table.occurredAt')}
              </TableHead>
              <TableHead className="min-w-[180px] bg-background">
                {t('auditLogs.table.actor')}
              </TableHead>
              <TableHead className="min-w-[160px] bg-background">
                {t('auditLogs.table.eventType')}
              </TableHead>
              <TableHead className="min-w-[120px] bg-background">
                {t('auditLogs.table.subjectType')}
              </TableHead>
              <TableHead className="min-w-[260px] bg-background font-mono text-xs">
                {t('auditLogs.table.subjectId')}
              </TableHead>
              <TableHead className="min-w-[260px] bg-background font-mono text-xs">
                {t('auditLogs.table.institutionId')}
              </TableHead>
              <TableHead className="min-w-[280px] max-w-[320px] bg-background whitespace-normal">
                {t('auditLogs.table.payload')}
              </TableHead>
              <TableHead className="min-w-[280px] max-w-[320px] bg-background whitespace-normal">
                {t('auditLogs.table.metadata')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleEvents.map((row) => {
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
      </ScrollArea>

      {events.length > PAGE_SIZE ? (
        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground text-sm">
            {t('auditLogs.paginationRange', {
              from: (currentPage - 1) * PAGE_SIZE + 1,
              to: Math.min(currentPage * PAGE_SIZE, events.length),
              total: events.length,
            })}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={handlePreviousPage}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
              {paginationItems.map((item, index) =>
                item === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === currentPage}
                      onClick={handlePageLink(item)}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={handleNextPage}
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  )
}

export { AdminAuditLogTable }
