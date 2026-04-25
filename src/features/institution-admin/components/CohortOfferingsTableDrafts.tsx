import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import { CohortOfferingsTable } from './CohortOfferingsTable'

type CohortOfferingsTableDraftsProps = {
  offerings: readonly CohortOfferingRecord[]
}

export function CohortOfferingsTableDrafts({ offerings }: CohortOfferingsTableDraftsProps) {
  const draftOfferings = offerings.filter((offering) => offering.status === 'draft')
  return <CohortOfferingsTable offerings={draftOfferings} />
}
