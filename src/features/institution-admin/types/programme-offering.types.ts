export type ProgrammeOfferingStatus = 'draft' | 'active' | 'archived'

export type ProgrammeOfferingRecord = {
  id: string
  institution_id: string
  programme_id: string
  academic_year: number
  term_code: string | null
  status: ProgrammeOfferingStatus
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}
