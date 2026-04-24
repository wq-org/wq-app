export type ClassroomStatus = 'active' | 'inactive'

export type ClassroomRecord = {
  readonly id: string
  readonly institution_id: string
  readonly class_group_id: string
  readonly class_group_offering_id: string | null
  readonly primary_teacher_id: string | null
  readonly title: string
  readonly status: ClassroomStatus
  readonly deactivated_at: string | null
  readonly created_at: string
  readonly updated_at: string
}
