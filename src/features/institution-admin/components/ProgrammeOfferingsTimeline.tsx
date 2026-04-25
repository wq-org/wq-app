import { AlertCircle, ChartNoAxesGantt, GraduationCap } from 'lucide-react'

import { SelectTabs } from '@/components/shared'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingTable } from './ProgrammeOfferingTable'

const TIMELINE_TAB = [{ id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt }] as const

type ProgrammeOfferingsTimelineProps = {
  offerings: readonly ProgrammeOfferingRecord[]
  isLoading: boolean
  loadError: string | null
  isProgrammeMissing: boolean
  isFilteredEmpty: boolean
  t: (key: string) => string
}

export function ProgrammeOfferingsTimeline({
  offerings,
  isLoading,
  loadError,
  isProgrammeMissing,
  isFilteredEmpty,
  t,
}: ProgrammeOfferingsTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner
          variant="gray"
          size="sm"
          speed={1750}
        />
      </div>
    )
  }

  if (loadError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertCircle className="size-6 text-destructive" />
          </EmptyMedia>
          <EmptyTitle>{t('faculties.pages.programmeOfferings.loadError')}</EmptyTitle>
          <EmptyDescription>{loadError}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (isProgrammeMissing) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GraduationCap className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('faculties.pages.programmeOfferings.titleFallback')}</EmptyTitle>
          <EmptyDescription>
            {t('faculties.pages.programmeOfferings.programmeNotFound')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (isFilteredEmpty) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartNoAxesGantt className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('faculties.pages.programmeOfferings.titleFallback')}</EmptyTitle>
          <EmptyDescription>{t('faculties.pages.programmeOfferings.empty')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SelectTabs
        tabs={TIMELINE_TAB}
        activeTabId="timeline"
        onTabChange={() => {}}
      />
      <ProgrammeOfferingTable offerings={offerings} />
    </div>
  )
}
