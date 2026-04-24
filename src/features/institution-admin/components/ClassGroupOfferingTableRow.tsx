import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'

type ClassGroupOfferingTableRowProps = {
  offering: ClassGroupOfferingRecord
}

function toRowStatus(status: ClassGroupOfferingRecord['status']): 'active' | 'inactive' {
  return status === 'active' ? 'active' : 'inactive'
}

function formatDate(value: string | null, locale: string, fallback: string): string {
  if (!value) return fallback
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const parts = formatter.formatToParts(new Date(value))
  const day = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const year = parts.find((p) => p.type === 'year')?.value
  if (!day || !month || !year) return fallback
  return `${day}. ${month} ${year}`
}

export function ClassGroupOfferingTableRow({ offering }: ClassGroupOfferingTableRowProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const status = toRowStatus(offering.status)
  const statusLabel =
    status === 'active'
      ? t('faculties.pages.classGroupOfferings.offering.statusActive')
      : t('faculties.pages.classGroupOfferings.offering.statusInactive')
  const statusVariant = status === 'active' ? 'green' : 'secondary'
  const notSet = t('faculties.pages.classGroupOfferings.offering.notSet')
  const startLabel = formatDate(offering.starts_at, i18n.language, notSet)
  const endLabel = formatDate(offering.ends_at, i18n.language, notSet)
  const dateRange = `${startLabel} - ${endLabel}`

  return (
    <TableRow>
      <TableCell>{dateRange}</TableCell>
      <TableCell className="text-right">
        <Badge
          variant={statusVariant}
          size="sm"
          className="font-normal"
        >
          {statusLabel}
        </Badge>
      </TableCell>
    </TableRow>
  )
}
