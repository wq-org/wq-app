import { supabase } from '@/lib/supabase'
import { getUserInstitutionId } from '@/features/auth/api/authApi'
import type { UserRole } from '@/features/auth/types/auth.types'
import type { Game, UpdateGameData } from '../types/command-bar.types'

export interface SearchableProfile {
  user_id: string
  username: string | null
  display_name: string | null
  email: string | null
  avatar_url: string | null
  role: UserRole | null
}

/**
 * Create a new game
 */
export async function createGame(
  teacherId: string,
  { title, description }: { title: string; description: string },
): Promise<Game> {
  // Get teacher's institution_id
  const institutionId = await getUserInstitutionId(teacherId)

  const { data, error } = await supabase
    .from('games')
    .insert({
      title,
      description,
      teacher_id: teacherId,
      institution_id: institutionId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating game:', error)
    throw error
  }

  return data as Game
}

/**
 * Update an existing game
 */
export async function updateGame(gameId: string, updates: UpdateGameData): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .select()
    .single()

  if (error) {
    console.error('Error updating game:', error)
    throw error
  }

  return data as Game
}

/**
 * Delete a game
 */
export async function deleteGame(gameId: string): Promise<void> {
  const { error } = await supabase.from('games').delete().eq('id', gameId)

  if (error) {
    console.error('Error deleting game:', error)
    throw error
  }
}

/**
 * Get all games for a teacher
 */
export async function getTeacherGames(teacherId: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching games:', error)
    throw error
  }

  return (data || []) as Game[]
}

/**
 * Get a single game by ID
 */
export async function getGameById(gameId: string): Promise<Game | null> {
  const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single()

  if (error) {
    console.error('Error fetching game:', error)
    throw error
  }

  return data as Game | null
}

/**
 * Fetch searchable users from the same institution(s) as the current user.
 */
export async function fetchProfilesForSearch(): Promise<SearchableProfile[]> {
  const { data, error } = await supabase.rpc('list_searchable_profiles_in_my_institutions')

  if (error) {
    console.error('Error fetching profiles:', error)
    throw error
  }

  return (data ?? []) as SearchableProfile[]
}
