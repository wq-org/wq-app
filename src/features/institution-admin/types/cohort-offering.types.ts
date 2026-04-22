import type { ProgrammeOfferingStatus } from './programme-offering.types'

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
}
