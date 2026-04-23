export type CohortRecord = {
  id: string
  institution_id: string
  programme_id: string
  name: string
  description: string | null
  academic_year: number | null
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}
