import { useState, useEffect } from 'react'
import { getCompleteProfile } from '@/features/auth/api/authApi'
import type { Profile } from '@/contexts/user/UserContext'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const data = await getCompleteProfile(userId)
        setProfile(data as Profile | null)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch profile')
        setError(error)
        console.error('Error fetching profile:', err)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return { profile, loading, error }
}

