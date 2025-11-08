import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/features/auth/api/authApi';

interface MinimalProfile {
  user_id: string;
  role: string | null;
  is_onboarded: boolean;
}

interface UserContextValue {
  session: any | null;
  profile: MinimalProfile | null;
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
  const [profile, setProfile] = useState<MinimalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRoleState] = useState<string | null>(() => {
    // Initialize from sessionStorage for persistence across refreshes
    return sessionStorage.getItem(PENDING_ROLE_KEY);
  });

  // Load initial session from supabase and localStorage
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const p = await getProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
      const p = await getProfile(session.user.id);
      setProfile(p);
    }
  };

  return (
    <UserContext.Provider value={{ session, profile, loading, pendingRole, setPendingRole, clearPendingRole, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
