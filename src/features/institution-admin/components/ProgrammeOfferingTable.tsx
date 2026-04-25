import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Tick, TickContent, TickContents, TickTrack, Ticks } from '@/components/ui/tick'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'

const TIMELINE_MIN_YEAR = 2020
const TIMELINE_MAX_YEAR = 2030

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

function getTimelineYear(value: string | null, fallback: number): number {
  if (!value) return fallback
  const year = new Date(value).getUTCFullYear()
  if (!Number.isFinite(year)) return fallback
  return year
}

type ProgrammeOfferingTableProps = {
  offerings: readonly ProgrammeOfferingRecord[]
}

export function ProgrammeOfferingTable({ offerings }: ProgrammeOfferingTableProps) {
  const { t, i18n } = useTranslation('features.institution-admin')

  const ticks = Array.from(
    { length: TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR + 1 },
    (_, index) => TIMELINE_MIN_YEAR + index,
  )

  return (
    <TickTrack className="gap-4">
      <Ticks>
        {ticks.map((tick) => (
          <Tick
            key={tick}
            minor={(tick - TIMELINE_MIN_YEAR) % 2 !== 0}
            hideLabel={(tick - TIMELINE_MIN_YEAR) % 2 !== 0}
          >
            {tick}
          </Tick>
        ))}
      </Ticks>
      <TickContents>
        {offerings.map((offering) => {
          const startsAt = getTimelineYear(offering.starts_at, TIMELINE_MIN_YEAR)
          const endsAt = getTimelineYear(offering.ends_at, TIMELINE_MAX_YEAR)
          const dateRange = `${formatDate(offering.starts_at, i18n.language, t('faculties.pages.programmeOfferings.offering.notSet'))} - ${formatDate(offering.ends_at, i18n.language, t('faculties.pages.programmeOfferings.offering.notSet'))}`
          const statusLabel =
            offering.status === 'active'
              ? t('faculties.pages.programmeOfferings.offering.statusActive')
              : t('faculties.pages.programmeOfferings.offering.statusInactive')
          const statusVariant = offering.status === 'active' ? 'green' : 'secondary'
          const termLabel =
            offering.term_code?.trim() || t('faculties.pages.programmeOfferings.offering.notSet')

          return (
            <TickContent
              key={offering.id}
              start={startsAt}
              end={endsAt}
              min={TIMELINE_MIN_YEAR}
              max={TIMELINE_MAX_YEAR}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-xs font-medium text-foreground">{termLabel}</p>
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
