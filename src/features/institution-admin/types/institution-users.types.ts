export type InstitutionUserRow = {
  user_id: string
  display_name: string | null
  email: string | null
  username: string | null
  role: string
  is_active: boolean
  avatar_url?: string | null
}

export type InstitutionUsersDialogState =
  | null
  | { mode: 'assignClass'; user: InstitutionUserRow }
  | { mode: 'withdrawFromClass'; user: InstitutionUserRow }
  | { mode: 'removeFromInstitution'; user: InstitutionUserRow }
