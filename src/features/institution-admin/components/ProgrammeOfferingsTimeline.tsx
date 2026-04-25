import { useState } from 'react'
import { AlertCircle, Archive, ChartNoAxesGantt, FileSliders, GraduationCap } from 'lucide-react'

import { SelectTabs } from '@/components/shared'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingsTable } from './ProgrammeOfferingsTable'
import { ProgrammeOfferingsTimelineCardList } from './ProgrammeOfferingsTimelineCardList'

const TIMELINE_TAB = [
  { id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt },
  { id: 'drafts', title: 'Drafts', icon: FileSliders },
  { id: 'archived', title: 'Archived', icon: Archive },
] as const

type TimelineTabId = (typeof TIMELINE_TAB)[number]['id']

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
  const [activeTabId, setActiveTabId] = useState<TimelineTabId>('timeline')

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

  const activeOfferings = offerings.filter((offering) => offering.status === 'active')
  const draftOfferings = offerings.filter((offering) => offering.status === 'draft')
  const archivedOfferings = offerings.filter((offering) => offering.status === 'archived')

  return (
    <div className="flex flex-col gap-4">
      <SelectTabs
        tabs={TIMELINE_TAB}
        activeTabId={activeTabId}
        onTabChange={(tabId) => setActiveTabId(tabId as TimelineTabId)}
      />
      {activeTabId === 'timeline' ? (
        <ProgrammeOfferingsTable offerings={activeOfferings} />
      ) : activeTabId === 'drafts' ? (
        <ProgrammeOfferingsTimelineCardList offerings={draftOfferings} />
      ) : (
        <ProgrammeOfferingsTimelineCardList offerings={archivedOfferings} />
      )}
    </div>
  )
}
