import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'

type ProgrammeOfferingCardProps = {
  offering: ProgrammeOfferingRecord
}

function toCardStatus(status: ProgrammeOfferingRecord['status']): 'active' | 'inactive' {
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

export function ProgrammeOfferingCard({ offering }: ProgrammeOfferingCardProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const status = toCardStatus(offering.status)
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
    <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-4 md:items-center">
      <div>
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('faculties.pages.programmeOfferings.offering.termCode')}
        </Text>
        <Text as="p">{resolvedTermCode}</Text>
      </div>

      <div>
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('faculties.pages.programmeOfferings.offering.academicYear')}
        </Text>
        <Text as="p">{String(offering.academic_year)}</Text>
      </div>

      <div>
        <Text
          as="p"
          variant="small"
          color="muted"
        >
          {t('faculties.pages.programmeOfferings.offering.dateRange')}
        </Text>
        <Text as="p">{dateRange}</Text>
      </div>

      <div className="md:justify-self-end">
        <Badge
          variant={statusVariant}
          size="sm"
          className="font-normal"
        >
          {statusLabel}
        </Badge>
      </div>
    </div>
  )
}
