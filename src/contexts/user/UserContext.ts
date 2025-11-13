import { createContext, useContext } from 'react';

export interface Profile {
  user_id: string;
  role: string | null;
  is_onboarded: boolean;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  description: string | null;
}

export interface UserContextValue {
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  pendingRole: string | null;
  setPendingRole: (role: string) => void;
  clearPendingRole: () => void;
  refreshProfile: () => Promise<void>;
  getUserId: () => string | null;
  getRole: () => string | null;
  logout: () => Promise<void>;
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
});

export const useUser = () => useContext(UserContext);
