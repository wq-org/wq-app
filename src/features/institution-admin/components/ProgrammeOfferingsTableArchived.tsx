import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingsTable } from './ProgrammeOfferingsTable'

type ProgrammeOfferingsTableArchivedProps = {
  offerings: readonly ProgrammeOfferingRecord[]
}

export function ProgrammeOfferingsTableArchived({
  offerings,
}: ProgrammeOfferingsTableArchivedProps) {
  const archivedOfferings = offerings.filter((offering) => offering.status === 'archived')
  return <ProgrammeOfferingsTable offerings={archivedOfferings} />
}
