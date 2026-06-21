import { useTranslation } from 'react-i18next'
import { History, PackageCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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
import type { PlanVersion, PlanVersionStatus } from '../types/planVersions.types'

type VersionStatusBadgeProps = {
  status: PlanVersionStatus
  t: (key: string) => string
}

function VersionStatusBadge({ status, t }: VersionStatusBadgeProps) {
  if (status === 'published')
    return <Badge variant="darkblue">{t('planCatalog.versions.status.published')}</Badge>
  if (status === 'archived')
    return <Badge variant="secondary">{t('planCatalog.versions.status.archived')}</Badge>
  return <Badge variant="orange">{t('planCatalog.versions.status.draft')}</Badge>
}

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

function formatPrice(priceAmount: string | null, currency: string): string {
  if (!priceAmount || priceAmount === 'null') return '—'
  const amount = parseFloat(priceAmount)
  if (Number.isNaN(amount)) return '—'
  try {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount)
  } catch {
    return `${priceAmount} ${currency}`
  }
}

type PlanVersionsListProps = {
  versions: PlanVersion[]
  isLoading: boolean
  error: string | null
}

function PlanVersionsList({ versions, isLoading, error }: PlanVersionsListProps) {
  const { t, i18n } = useTranslation('features.admin')
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US'

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  if (error) {
    return (
      <Text
        as="p"
        variant="small"
        color="danger"
        role="alert"
      >
        {t('planCatalog.versions.loadError')}: {error}
      </Text>
    )
  }

  if (versions.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <History aria-hidden />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('planCatalog.versions.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('planCatalog.versions.empty.description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">{t('planCatalog.versions.table.version')}</TableHead>
            <TableHead>{t('planCatalog.versions.table.status')}</TableHead>
            <TableHead>{t('planCatalog.versions.table.name')}</TableHead>
            <TableHead>{t('planCatalog.versions.table.price')}</TableHead>
            <TableHead>{t('planCatalog.versions.table.publishedAt')}</TableHead>
            <TableHead className="max-w-[300px]">
              {t('planCatalog.versions.table.changeNote')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((v) => (
            <TableRow key={v.id}>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <PackageCheck
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <Text
                    as="span"
                    variant="small"
                    className="font-mono font-semibold"
                  >
                    v{v.versionNo}
                  </Text>
                </div>
              </TableCell>
              <TableCell>
                <VersionStatusBadge
                  status={v.status}
                  t={t}
                />
              </TableCell>
              <TableCell>
                <Text
                  as="span"
                  variant="small"
                >
                  {v.name}
                </Text>
              </TableCell>
              <TableCell>
                <Text
                  as="span"
                  variant="small"
                  className="tabular-nums"
                >
                  {formatPrice(v.priceAmount, v.currency)}
                </Text>
              </TableCell>
              <TableCell>
                <Text
                  as="span"
                  variant="small"
                  color="muted"
                  className="whitespace-nowrap"
                >
                  {formatDate(v.publishedAt, locale)}
                </Text>
              </TableCell>
              <TableCell className="max-w-[300px]">
                {v.changeNote ? (
                  <Text
                    as="span"
                    variant="small"
                    color="muted"
                    className="line-clamp-2"
                  >
                    {v.changeNote}
                  </Text>
                ) : (
                  <Text
                    as="span"
                    variant="small"
                    color="muted"
                  >
                    —
                  </Text>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { PlanVersionsList }
