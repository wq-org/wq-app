/** Raw row from `institution_invites` (explicit select list). */
export type InstitutionInviteRow = {
  id: string
  institution_id: string
  email: string
  membership_role: string
  token: string
  expires_at: string
  invited_by: string | null
  accepted_at: string | null
  accepted_user_id: string | null
  created_at: string
}

/** UI model — mapped in api module only. */
export type InstitutionInvite = {
  id: string
  institutionId: string
  email: string
  membershipRole: string
  token: string
  expiresAtIso: string
  invitedByUserId: string | null
  acceptedAtIso: string | null
  acceptedUserId: string | null
  createdAtIso: string
}
