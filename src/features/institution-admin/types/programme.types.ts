export type ProgrammeProgressionType = 'year_group' | 'stage'

export type ProgrammeRecord = {
  id: string
  institution_id: string
  faculty_id: string
  name: string
  description: string | null
  duration_years: number | null
  progression_type: ProgrammeProgressionType | null
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}
