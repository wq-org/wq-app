import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Tick, TickContent, TickContents, TickTrack, Ticks } from '@/components/ui/tick'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'

const TIMELINE_MIN_MONTH = 1
const TIMELINE_MAX_MONTH = 12
const MONTH_TICKS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function formatDate(value: string | null, locale: string, fallback: string): string {
  if (!value) return fallback
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const parts = formatter.formatToParts(new Date(value))
  const day = parts.find((part) => part.type === 'day')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const year = parts.find((part) => part.type === 'year')?.value
  if (!day || !month || !year) return fallback
  return `${day}. ${month} ${year}`
}

function getTimelineMonth(value: string | null, fallback: number): number {
  if (!value) return fallback
  const month = new Date(value).getUTCMonth() + 1
  if (!Number.isFinite(month)) return fallback
  return month
}

type CohortOfferingsTableProps = {
  offerings: readonly CohortOfferingRecord[]
}

export function CohortOfferingsTable({ offerings }: CohortOfferingsTableProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  return (
    <TickTrack className="gap-4">
      <Ticks>
        {MONTH_TICKS.map((label) => (
          <Tick key={label}>{label}</Tick>
        ))}
      </Ticks>
      <TickContents>
        {offerings.map((offering) => {
          const startsAt = getTimelineMonth(offering.starts_at, TIMELINE_MIN_MONTH)
          const endsAt = getTimelineMonth(offering.ends_at, TIMELINE_MAX_MONTH)
          const statusLabel =
            offering.status === 'active'
              ? t('faculties.pages.cohortOfferings.offering.statusActive')
              : t('faculties.pages.cohortOfferings.offering.statusInactive')
          const statusVariant = offering.status === 'active' ? 'green' : 'secondary'
          const notSet = t('faculties.pages.cohortOfferings.offering.notSet')
          const dateRange = `${formatDate(offering.starts_at, i18n.language, notSet)} - ${formatDate(offering.ends_at, i18n.language, notSet)}`
          const po = offering.programme_offering
          const programmeOfferingName = (() => {
            if (!po) {
              return t('faculties.pages.cohortOfferings.offering.programmeOfferingUnknown')
            }
            const term = po.term_code?.trim()
            const year = String(po.academic_year)
            if (term) return `${term} (${year})`
            return year
          })()

          return (
            <TickContent
              key={offering.id}
              start={startsAt}
              end={endsAt}
              min={TIMELINE_MIN_MONTH}
              max={TIMELINE_MAX_MONTH}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-xs font-medium text-foreground">
                    {programmeOfferingName}
                  </p>
                  <p className="text-xs text-muted-foreground">{dateRange}</p>
                </div>
                <Badge
                  variant={statusVariant}
                  size="sm"
                  className="shrink-0 font-normal"
                >
                  {statusLabel}
                </Badge>
              </div>
            </TickContent>
          )
        })}
      </TickContents>
    </TickTrack>
  )
}
