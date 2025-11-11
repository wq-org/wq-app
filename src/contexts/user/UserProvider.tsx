import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getCompleteProfile, logoutUser } from '@/features/auth/api/authApi';
import { UserContext, type Profile, type UserContextValue } from './UserContext';

const PENDING_ROLE_KEY = 'wq_pending_role';

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

  // Getter for userId
  const getUserId = () => {
    if (session?.user?.id) {
      return session.user.id;
    }
    if (profile?.user_id) {
      return profile.user_id;
    }
    return null;
  };

  // Getter for role
  const getRole = () => {
    if (profile?.role) {
      return profile.role;
    }
    return null;
  };

  // Logout function that clears all state and storage
  const handleLogout = useCallback(async () => {
    try {
      // Clear pending role
      clearPendingRole();
      
      // Call the logout API function which clears Supabase session and storage
      await logoutUser();
      
      // Clear local state
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Even on error, clear local state
      setSession(null);
      setProfile(null);
      clearPendingRole();
    }
  }, [clearPendingRole]);

  const value: UserContextValue = {
    session,
    profile,
    loading,
    pendingRole,
    setPendingRole,
    clearPendingRole,
    refreshProfile,
    getUserId,
    getRole,
    logout: handleLogout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

