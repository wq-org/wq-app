import type { ProgrammeOfferingStatus } from './programme-offering.types'

/** Snapshot of the linked programme offering for display (no dedicated name column in DB). */
export type CohortOfferingProgrammeOfferingSummary = {
  academic_year: number
  term_code: string | null
}

export type CohortOfferingRecord = {
  id: string
  institution_id: string
  programme_offering_id: string
  cohort_id: string
  status: ProgrammeOfferingStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  /** Set when loaded with programme offerings for the same programme (e.g. cohort offerings page). */
  programme_offering?: CohortOfferingProgrammeOfferingSummary | null
}
