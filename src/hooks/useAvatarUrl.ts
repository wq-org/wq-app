import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAvatarUrl(path?: string | null, expiresIn = 3600) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function sign() {
      if (!path) {
        setUrl(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error signing avatar url:', error);
        setUrl(null);
      } else {
        setUrl(data?.signedUrl || null);
      }
      setLoading(false);
    }
    sign();
  }, [path, expiresIn]);

  return { url, loading };
}
