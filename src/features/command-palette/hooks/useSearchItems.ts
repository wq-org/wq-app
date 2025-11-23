import { useState, useEffect } from 'react'
import { fetchProfilesForSearch, fetchInstitutionsForSearch } from '../api/commandPaletteApi'

export interface SearchItem {
  id: string
  type: 'student' | 'teacher' | 'institution'
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
        // Fetch students and teachers from profiles table
        const profiles = await fetchProfilesForSearch()

        // Fetch institutions
        const institutions = await fetchInstitutionsForSearch()

        // Transform profiles to SearchItem format
        const profileItems: SearchItem[] = profiles.map((profile) => ({
          id: profile.user_id,
          type: profile.role as 'student' | 'teacher',
          title: profile.display_name || profile.username || 'Unknown',
          email: profile.email,
          username: profile.username,
          avatar_url: profile.avatar_url,
        }))

        // Transform institutions to SearchItem format
        const institutionItems: SearchItem[] = institutions.map((institution) => ({
          id: institution.id,
          type: 'institution',
          title: institution.name,
          email: institution.email,
          username: null,
          avatar_url: null,
        }))

        setItems([...profileItems, ...institutionItems])
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
