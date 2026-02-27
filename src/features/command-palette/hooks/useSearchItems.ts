import { useState, useEffect } from 'react'
import type { UserRole } from '@/features/auth/types/auth.types'
import { fetchProfilesForSearch, type SearchableProfile } from '../api/commandPaletteApi'

export interface SearchItem {
  id: string
  type: UserRole
  title: string
  email: string | null
  username: string | null
  avatar_url?: string | null
}

export function useSearchItems() {
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      setError(null)
      try {
        // Fetch searchable users from the same institution(s).
        const profiles = await fetchProfilesForSearch()
        const profileItems: SearchItem[] = profiles.map((profile: SearchableProfile) => {
          const role = (profile.role ?? 'student') as UserRole

          return {
            id: profile.user_id,
            type: role,
            title: profile.display_name || profile.username || 'Unknown',
            email: profile.email,
            username: profile.username,
            avatar_url: profile.avatar_url,
          }
        })

        setItems(profileItems)
      } catch (err) {
        console.error('Error fetching search items:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch search items'))
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  return { items, loading, error }
}
