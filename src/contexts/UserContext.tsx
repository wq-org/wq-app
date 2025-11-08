import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getCompleteProfile } from '@/features/auth/api/authApi';

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

interface UserContextValue {
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  pendingRole: string | null;
  setPendingRole: (role: string) => void;
  clearPendingRole: () => void;
  refreshProfile: () => Promise<void>;
}

const PENDING_ROLE_KEY = 'wq_pending_role';

const UserContext = createContext<UserContextValue>({
  session: null,
  profile: null,
  loading: true,
  pendingRole: null,
  setPendingRole: () => {},
  clearPendingRole: () => {},
  refreshProfile: async () => {},
}); 

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRoleState] = useState<string | null>(() => {
    // Initialize from sessionStorage for persistence across refreshes
    return sessionStorage.getItem(PENDING_ROLE_KEY);
  });

  // Fetch complete profile data from profiles table (includes all fields)
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const data = await getCompleteProfile(userId);
      setProfile(data as Profile | null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  }, []);

  // Load initial session from supabase and localStorage
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        // Fetch complete profile data after login/signup
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Fetch complete profile when auth state changes (login/signup)
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Centralized role state management
  const setPendingRole = (role: string) => {
    setPendingRoleState(role);
    sessionStorage.setItem(PENDING_ROLE_KEY, role);
  };

  const clearPendingRole = () => {
    setPendingRoleState(null);
    sessionStorage.removeItem(PENDING_ROLE_KEY);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  return (
    <UserContext.Provider value={{ 
      session, 
      profile, 
      loading, 
      pendingRole, 
      setPendingRole, 
      clearPendingRole, 
      refreshProfile
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
