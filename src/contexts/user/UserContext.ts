import type { UserRole } from '@/features/auth'
import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface Profile {
  user_id: string
  role: UserRole | null
  is_onboarded: boolean
  username: string | null
  display_name: string | null
  avatar_url: string | null
  email: string | null
  description: string | null
  linkedin_url: string | null
  follow_count?: number | null
  userInstitutionId: string | null
  institution?: {
    id: string
    name: string | null
    slug: string | null
    email: string | null
  } | null
}

export interface UserContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  pendingRole: string | null
  setPendingRole: (role: string) => void
  clearPendingRole: () => void
  refreshProfile: () => Promise<Profile | null>
  getUserId: () => string | null
  getRole: () => UserRole | null
  getUserInstitutionId: () => string | null
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextValue>({
  session: null,
  profile: null,
  loading: true,
  pendingRole: null,
  setPendingRole: () => {},
  clearPendingRole: () => {},
  refreshProfile: async () => null,
  getUserId: () => null,
  getRole: () => null,
  getUserInstitutionId: () => null,
  logout: async () => {},
})

export const useUser = () => useContext(UserContext)
