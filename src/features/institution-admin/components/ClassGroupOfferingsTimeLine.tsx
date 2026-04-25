import { useState } from 'react'
import { Archive, ChartNoAxesGantt, FileSliders } from 'lucide-react'

import { SelectTabs } from '@/components/shared'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import { ClassGroupOfferingsTimelineCardList } from './ClassGroupOfferingsTimelineCardList'
import { ClassGroupOfferingsTable } from './ClassGroupOfferingsTable'

const TIMELINE_TAB = [
  { id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt },
  { id: 'drafts', title: 'Drafts', icon: FileSliders },
  { id: 'archived', title: 'Archived', icon: Archive },
] as const

type TimelineTabId = (typeof TIMELINE_TAB)[number]['id']

type ClassGroupOfferingsTimeLineProps = {
  offerings: readonly ClassGroupOfferingRecord[]
}

export function ClassGroupOfferingsTimeLine({ offerings }: ClassGroupOfferingsTimeLineProps) {
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
        <ClassGroupOfferingsTable offerings={activeOfferings} />
      ) : activeTabId === 'drafts' ? (
        <ClassGroupOfferingsTimelineCardList offerings={draftOfferings} />
      ) : (
        <ClassGroupOfferingsTimelineCardList offerings={archivedOfferings} />
      )}
    </div>
  )
}
