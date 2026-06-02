import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import { CohortOfferingsTable } from './CohortOfferingsTable'

type CohortOfferingsTableDraftsProps = {
  offerings: readonly CohortOfferingRecord[]
  onEditOffering?: (offeringId: string) => void
  onArchiveOffering?: (offeringId: string) => void
}

export function CohortOfferingsTableDrafts({
  offerings,
  onEditOffering,
  onArchiveOffering,
}: CohortOfferingsTableDraftsProps) {
  const draftOfferings = offerings.filter((offering) => offering.status === 'draft')
  return (
    <CohortOfferingsTable
      offerings={draftOfferings}
      onEditOffering={onEditOffering}
      onArchiveOffering={onArchiveOffering}
    />
  )
}
