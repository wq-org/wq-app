export type MembershipStatusDb = 'invited' | 'active' | 'suspended'

export type InstitutionUserRow = {
  user_id: string
  display_name: string | null
  email: string | null
  username: string | null
  role: string
  /** @deprecated use membership_status when present */
  is_active: boolean
  avatar_url?: string | null
  membership_status?: MembershipStatusDb
}

export type InstitutionMemberDirectoryRow = {
  rowKind: 'member'
  user_id: string
  display_name: string | null
  email: string | null
  username: string | null
  membership_role: string
  membership_status: MembershipStatusDb
  avatar_url?: string | null
}

export type InstitutionInviteDirectoryRow = {
  rowKind: 'invite'
  invite_token: string
  email: string
  membership_role: 'teacher' | 'student'
  expires_at: string
}

export type InstitutionDirectoryRow = InstitutionMemberDirectoryRow | InstitutionInviteDirectoryRow

export function directoryMemberToUserRow(row: InstitutionMemberDirectoryRow): InstitutionUserRow {
  return {
    user_id: row.user_id,
    display_name: row.display_name,
    email: row.email,
    username: row.username,
    role: row.membership_role,
    is_active: row.membership_status === 'active',
    avatar_url: row.avatar_url ?? null,
    membership_status: row.membership_status,
  }
}

export type InstitutionUsersDialogState =
  | null
  | { mode: 'assignClass'; user: InstitutionUserRow }
  | { mode: 'withdrawFromClass'; user: InstitutionUserRow }
  | { mode: 'removeFromInstitution'; user: InstitutionUserRow }
