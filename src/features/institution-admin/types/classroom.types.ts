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

export type ClassroomMemberRole = 'student' | 'co_teacher'

/** Profile fields returned by `profiles(...)` on classroom_members queries. */
export type ClassroomMemberProfile = {
  readonly display_name: string | null
  readonly username: string | null
  readonly email: string | null
  readonly avatar_url: string | null
}

export type ClassroomMemberRow = {
  readonly id: string
  readonly classroom_id: string
  readonly user_id: string
  readonly membership_role: ClassroomMemberRole
  readonly enrolled_at: string
  /**
   * Embedded profile from PostgREST. Supabase client inference may use an object
   * or a single-element array for this FK embed; normalize in the API mapper.
   */
  readonly profiles: ClassroomMemberProfile | readonly ClassroomMemberProfile[] | null
}

export type ClassroomMember = {
  readonly id: string
  readonly userId: string
  readonly name: string
  readonly email: string
  readonly avatarUrl: string | null
  readonly role: ClassroomMemberRole
}
