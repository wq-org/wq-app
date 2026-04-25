import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import { ClassGroupOfferingsTable } from './ClassGroupOfferingsTable'

type ClassGroupOfferingsTableDraftsProps = {
  offerings: readonly ClassGroupOfferingRecord[]
}

export function ClassGroupOfferingsTableDrafts({ offerings }: ClassGroupOfferingsTableDraftsProps) {
  const draftOfferings = offerings.filter((offering) => offering.status === 'draft')
  return <ClassGroupOfferingsTable offerings={draftOfferings} />
}
