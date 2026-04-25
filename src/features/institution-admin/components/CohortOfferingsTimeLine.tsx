import { useState } from 'react'
import { Archive, ChartNoAxesGantt, FileSliders } from 'lucide-react'

import { SelectTabs } from '@/components/shared'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import { CohortOfferingsTimelineCardList } from './CohortOfferingsTimelineCardList'
import { CohortOfferingsTable } from './CohortOfferingsTable'

const TIMELINE_TAB = [
  { id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt },
  { id: 'drafts', title: 'Drafts', icon: FileSliders },
  { id: 'archived', title: 'Archived', icon: Archive },
] as const

type TimelineTabId = (typeof TIMELINE_TAB)[number]['id']

type CohortOfferingsTimeLineProps = {
  offerings: readonly CohortOfferingRecord[]
}

export function CohortOfferingsTimeLine({ offerings }: CohortOfferingsTimeLineProps) {
  const [activeTabId, setActiveTabId] = useState<TimelineTabId>('timeline')

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
        <CohortOfferingsTable offerings={activeOfferings} />
      ) : activeTabId === 'drafts' ? (
        <CohortOfferingsTimelineCardList offerings={draftOfferings} />
      ) : (
        <CohortOfferingsTimelineCardList offerings={archivedOfferings} />
      )}
    </div>
  )
}
