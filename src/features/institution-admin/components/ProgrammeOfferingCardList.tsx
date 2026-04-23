import { ChartNoAxesGantt } from 'lucide-react'

import { SelectTabs } from '@/components/shared'
import { Separator } from '@/components/ui/separator'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingCard } from './ProgrammeOfferingCard'

const TIMELINE_TAB = [{ id: 'timeline', title: 'Timeline', icon: ChartNoAxesGantt }] as const

type ProgrammeOfferingCardListProps = {
  offerings: readonly ProgrammeOfferingRecord[]
}

export function ProgrammeOfferingCardList({ offerings }: ProgrammeOfferingCardListProps) {
  return (
    <div className="flex flex-col gap-4">
      <SelectTabs
        tabs={TIMELINE_TAB}
        activeTabId="timeline"
        onTabChange={() => {}}
      />
      <div className="rounded-2xl border">
        {offerings.map((offering, index) => (
          <div key={offering.id}>
            <ProgrammeOfferingCard offering={offering} />
            {index < offerings.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
