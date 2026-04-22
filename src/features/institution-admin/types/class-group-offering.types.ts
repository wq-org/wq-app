import type { ProgrammeOfferingStatus } from './programme-offering.types'

export type ClassGroupOfferingRecord = {
  id: string
  institution_id: string
  cohort_offering_id: string
  class_group_id: string
  status: ProgrammeOfferingStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}
