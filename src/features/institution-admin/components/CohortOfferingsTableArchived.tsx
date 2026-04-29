import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import { CohortOfferingsTable } from './CohortOfferingsTable'

type CohortOfferingsTableArchivedProps = {
  offerings: readonly CohortOfferingRecord[]
  onEditOffering?: (offeringId: string) => void
  onArchiveOffering?: (offeringId: string) => void
}

export function CohortOfferingsTableArchived({
  offerings,
  onEditOffering,
  onArchiveOffering,
}: CohortOfferingsTableArchivedProps) {
  const archivedOfferings = offerings.filter((offering) => offering.status === 'archived')
  return (
    <CohortOfferingsTable
      offerings={archivedOfferings}
      onEditOffering={onEditOffering}
      onArchiveOffering={onArchiveOffering}
    />
  )
}
