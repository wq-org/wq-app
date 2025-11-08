import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/UserContext';

interface FullProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  description: string | null;
  role: string | null;
}

export function useFullProfile() {
  const { session } = useUser();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, email, description, role')
        .eq('user_id', session.user.id)
        .maybeSingle();
      if (error) {
        console.error('Error fetching full profile:', error);
      } else {
        setProfile(data as FullProfile);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [session?.user]);

  return { profile, loading };
}
