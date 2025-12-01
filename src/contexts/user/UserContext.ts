import type { Roles } from '@/components/layout/config'
import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface Profile {
  user_id: string
  role: string | null
  is_onboarded: boolean
  username: string | null
  display_name: string | null
  avatar_url: string | null
  email: string | null
  description: string | null
  linkedin_url: string | null
}

export interface UserContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  pendingRole: string | null
  setPendingRole: (role: string) => void
  clearPendingRole: () => void
  refreshProfile: () => Promise<void>
  getUserId: () => string | null
  getRole: () => Roles | null
  logout: () => Promise<void>
}

export const UserContext = createContext<UserContextValue>({
  session: null,
  profile: null,
  loading: true,
  pendingRole: null,
  setPendingRole: () => {},
  clearPendingRole: () => {},
  refreshProfile: async () => {},
  getUserId: () => null,
  getRole: () => null,
  logout: async () => {},
})

export const useUser = () => useContext(UserContext)
