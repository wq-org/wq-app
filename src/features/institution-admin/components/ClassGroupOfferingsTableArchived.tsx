import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'
import { ClassGroupOfferingsTable } from './ClassGroupOfferingsTable'

type ClassGroupOfferingsTableArchivedProps = {
  offerings: readonly ClassGroupOfferingRecord[]
}

export function ClassGroupOfferingsTableArchived({
  offerings,
}: ClassGroupOfferingsTableArchivedProps) {
  const archivedOfferings = offerings.filter((offering) => offering.status === 'archived')
  return <ClassGroupOfferingsTable offerings={archivedOfferings} />
}
