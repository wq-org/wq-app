import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'

type ProgrammeOfferingTableRowProps = {
  offering: ProgrammeOfferingRecord
}

function toRowStatus(status: ProgrammeOfferingRecord['status']): 'active' | 'inactive' {
  return status === 'active' ? 'active' : 'inactive'
}

function formatDateRange(
  startsAt: string | null,
  endsAt: string | null,
  locale: string,
  fallback: string,
) {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const toLongDate = (value: string | null): string => {
    if (!value) return fallback
    const parts = formatter.formatToParts(new Date(value))
    const day = parts.find((part) => part.type === 'day')?.value
    const month = parts.find((part) => part.type === 'month')?.value
    const year = parts.find((part) => part.type === 'year')?.value
    if (!day || !month || !year) return fallback
    return `${day}. ${month} ${year}`
  }

  const startLabel = toLongDate(startsAt)
  const endLabel = toLongDate(endsAt)
  return `${startLabel} - ${endLabel}`
}

export function ProgrammeOfferingTableRow({ offering }: ProgrammeOfferingTableRowProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const status = toRowStatus(offering.status)
  const statusLabel =
    status === 'active'
      ? t('faculties.pages.programmeOfferings.offering.statusActive')
      : t('faculties.pages.programmeOfferings.offering.statusInactive')
  const statusVariant = status === 'active' ? 'green' : 'secondary'
  const dateRange = formatDateRange(
    offering.starts_at,
    offering.ends_at,
    i18n.language,
    t('faculties.pages.programmeOfferings.offering.notSet'),
  )
  const resolvedTermCode =
    offering.term_code?.trim() || t('faculties.pages.programmeOfferings.offering.notSet')

  return (
    <TableRow>
      <TableCell>{resolvedTermCode}</TableCell>
      <TableCell>{String(offering.academic_year)}</TableCell>
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
