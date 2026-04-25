import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import { CohortOfferingsTable } from './CohortOfferingsTable'

type CohortOfferingsTableArchivedProps = {
  offerings: readonly CohortOfferingRecord[]
}

export function CohortOfferingsTableArchived({ offerings }: CohortOfferingsTableArchivedProps) {
  const archivedOfferings = offerings.filter((offering) => offering.status === 'archived')
  return <CohortOfferingsTable offerings={archivedOfferings} />
}
