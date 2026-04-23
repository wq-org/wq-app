import { Separator } from '@/components/ui/separator'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingCard } from './ProgrammeOfferingCard'

type ProgrammeOfferingCardListProps = {
  offerings: readonly ProgrammeOfferingRecord[]
}

export function ProgrammeOfferingCardList({ offerings }: ProgrammeOfferingCardListProps) {
  return (
    <div className="rounded-2xl border">
      {offerings.map((offering, index) => (
        <div key={offering.id}>
          <ProgrammeOfferingCard offering={offering} />
          {index < offerings.length - 1 ? <Separator /> : null}
        </div>
      ))}
    </div>
  )
}
