import { Archive, EllipsisVertical, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HoldConfirmButton } from '@/components/ui/HoldConfirmButton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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

type ProgrammeOfferingsTableProps = {
  offerings: readonly ProgrammeOfferingRecord[]
  onEditOffering?: (offeringId: string) => void
  onArchiveOffering?: (offeringId: string) => void
}

export function ProgrammeOfferingsTable({
  offerings,
  onEditOffering,
  onArchiveOffering,
}: ProgrammeOfferingsTableProps) {
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
              <div className="relative flex items-start justify-between gap-3 pb-7">
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
                <div className="absolute bottom-0 left-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-6"
                      >
                        <EllipsisVertical className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      side="top"
                      className="w-44 p-2"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="justify-start"
                          onClick={() => onEditOffering?.(offering.id)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <HoldConfirmButton
                          variant="orange"
                          size="sm"
                          className="justify-start"
                          icon={<Archive className="size-4 shrink-0" />}
                          onConfirm={() => onArchiveOffering?.(offering.id)}
                        >
                          Archive
                        </HoldConfirmButton>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </TickContent>
          )
        })}
      </TickContents>
    </TickTrack>
  )
}
