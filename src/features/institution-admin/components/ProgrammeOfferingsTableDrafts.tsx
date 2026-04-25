import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import { ProgrammeOfferingsTable } from './ProgrammeOfferingsTable'

type ProgrammeOfferingsTableDraftsProps = {
  offerings: readonly ProgrammeOfferingRecord[]
}

export function ProgrammeOfferingsTableDrafts({ offerings }: ProgrammeOfferingsTableDraftsProps) {
  const draftOfferings = offerings.filter((offering) => offering.status === 'draft')
  return <ProgrammeOfferingsTable offerings={draftOfferings} />
}
